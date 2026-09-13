export function normalizeEmailAddress(value) {
    return String(value ?? "").trim().toLowerCase();
}

export function buildEmailLinkContinuationUrl({ origin, path = "login.html", mode = "email-link", returnTo } = {}) {
    if (!origin) {
        return "";
    }

    const url = new URL(path, origin);
    url.searchParams.set("mode", mode);

    if (returnTo) {
        const safeReturnTo = /^[-a-z0-9_/]+\.html$/i.test(returnTo) ? returnTo : null;
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
        const parsed = new URL(value, typeof window !== "undefined" ? window.location.origin : "http://localhost");
        return Boolean(parsed.searchParams.get("oobCode")) && ["signIn", "verifyEmail", "recoverEmail"].includes(parsed.searchParams.get("mode"));
    } catch {
        return false;
    }
}

export function isSafeEmailLinkContinuationUrl(value) {
    if (!value) {
        return false;
    }

    try {
        const parsed = new URL(value, typeof window !== "undefined" ? window.location.origin : "http://localhost");

        if (!["http:", "https:"].includes(parsed.protocol)) {
            return false;
        }

        const allowedPaths = [
            "/login.html",
            "/client-dashboard.html",
            "/pro-dashboard.html",
            "/admin-dashboard.html"
        ];

        const pathAllowed = allowedPaths.includes(parsed.pathname);
        const isEmailLinkMode = parsed.searchParams.get("mode") === "email-link";
        const isAuthActionMode = Boolean(parsed.searchParams.get("oobCode")) && ["signIn", "verifyEmail", "recoverEmail"].includes(parsed.searchParams.get("mode"));
        return pathAllowed && (isEmailLinkMode || isAuthActionMode);
    } catch {
        return false;
    }
}
