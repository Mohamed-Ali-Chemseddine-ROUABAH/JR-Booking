export function normalizeEmailAddress(value) {
    return String(value ?? "").trim().toLowerCase();
}

const AUTH_RETURN_PATHS = new Set(["/login.html", "/client-dashboard.html", "/pro-dashboard.html", "/admin-dashboard.html"]);
const PROFILE_QUERY_KEYS = new Set(["pro", "service", "requestedDate", "requestedStart"]);

export function buildPublicProfileReturnTo({ origin, profileId, serviceId = "", date = "", start = "" } = {}) {
    if (!origin || !isValidProfileId(profileId)) return null;
    const url = new URL("profile.html", origin);
    url.searchParams.set("pro", profileId);

    if (serviceId !== "") {
        if (!isValidServiceId(serviceId)) return null;
        url.searchParams.set("service", String(serviceId));
    }
    if (date !== "") {
        if (!isValidDate(date)) return null;
        url.searchParams.set("requestedDate", date);
    }
    if (start !== "") {
        if (!isValidTime(start) || date === "") return null;
        url.searchParams.set("requestedStart", start);
    }

    return `${url.pathname.slice(1)}${url.search}`;
}

export function sanitizeAuthReturnTo(value, origin) {
    if (!value || !origin) return null;
    try {
        const base = new URL(origin);
        const url = new URL(value, base);
        if (url.origin !== base.origin || url.hash) return null;

        if (AUTH_RETURN_PATHS.has(url.pathname)) {
            return url.search ? null : url.pathname.slice(1);
        }

        const profilePath = new URL("profile.html", base).pathname;
        if (url.pathname !== profilePath) return null;
        for (const key of url.searchParams.keys()) {
            if (!PROFILE_QUERY_KEYS.has(key) || url.searchParams.getAll(key).length !== 1) return null;
        }
        if (!isValidProfileId(url.searchParams.get("pro"))) return null;

        const serviceId = url.searchParams.get("service");
        const date = url.searchParams.get("requestedDate");
        const start = url.searchParams.get("requestedStart");
        if (serviceId !== null && !isValidServiceId(serviceId)) return null;
        if (date !== null && !isValidDate(date)) return null;
        if (start !== null && (!isValidTime(start) || date === null)) return null;

        return `${url.pathname.slice(1)}${url.search}`;
    } catch {
        return null;
    }
}

function isValidProfileId(value) {
    return typeof value === "string" && value.length > 0 && value.length <= 150 && !/[\/?#\u0000-\u001f]/.test(value);
}

function isValidServiceId(value) {
    return /^(0|[1-9]\d{0,3})$/.test(String(value));
}

function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTime(value) {
    const match = /^(\d{2}):(\d{2})$/.exec(String(value));
    return Boolean(match && Number(match[1]) < 24 && Number(match[2]) < 60);
}

export function buildEmailLinkContinuationUrl({ origin, path = "login.html", mode = "email-link", returnTo } = {}) {
    if (!origin) {
        return "";
    }

    const url = new URL(path, origin);
    url.searchParams.set("mode", mode);

    if (returnTo) {
        const safeReturnTo = sanitizeAuthReturnTo(returnTo, origin);
        if (safeReturnTo) {
            url.searchParams.set("returnTo", safeReturnTo);
        }
    }

    return url.toString();
}

export function isEmailLinkCompletionUrl(value) {
    if (!value) {
        return false;
    }

    try {
        const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
        const parsed = new URL(value, origin);
        if (parsed.origin !== new URL(origin).origin) return false;
        return Boolean(parsed.searchParams.get("oobCode")) && ["signIn", "verifyEmail", "recoverEmail"].includes(parsed.searchParams.get("mode"));
    } catch {
        return false;
    }
}

export function isSafeEmailLinkContinuationUrl(value, origin = typeof window !== "undefined" ? window.location.origin : null) {
    if (!value || !origin) {
        return false;
    }

    try {
        const base = new URL(origin);
        const parsed = new URL(value, base);
        if (parsed.origin !== base.origin) return false;

        if (!["http:", "https:"].includes(parsed.protocol)) {
            return false;
        }

        const loginPath = new URL("login.html", origin).pathname;
        if (parsed.pathname === loginPath) {
            const mode = parsed.searchParams.get("mode");
            const isEmailLinkMode = mode === "email-link";
            const isAuthActionMode = Boolean(parsed.searchParams.get("oobCode")) && ["signIn", "verifyEmail", "recoverEmail"].includes(mode);
            if (!isEmailLinkMode && !isAuthActionMode) return false;
            const returnTo = parsed.searchParams.get("returnTo");
            return !returnTo || sanitizeAuthReturnTo(returnTo, origin) !== null;
        }

        return sanitizeAuthReturnTo(`${parsed.pathname}${parsed.search}`, origin) !== null;
    } catch {
        return false;
    }
}
