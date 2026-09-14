export function normalizeAdminLoginToken(value = "") {
    return String(value)
        .trim()
        .replace(/^admin[-_]?/i, "")
        .replace(/\.html$/i, "")
        .replace(/[^a-z0-9-]/gi, "")
        .toLowerCase();
}

export function getAdminLoginFilename(value = "") {
    const token = normalizeAdminLoginToken(value || "");
    if (!token) {
        return "admin-<unlisted-token>.html";
    }
    return `admin-${token}.html`;
}

export function getConfiguredAdminLoginFilename() {
    const configuredToken = (typeof window !== "undefined" && window.JR_ADMIN_LOGIN_TOKEN)
        || (typeof process !== "undefined" && process.env && process.env.ADMIN_LOGIN_TOKEN)
        || "";
    return getAdminLoginFilename(configuredToken);
}

export function getConfiguredAdminLoginUrl() {
    const filename = getConfiguredAdminLoginFilename();
    return `./${filename}`;
}

export function getAdminLoginRedirectTarget({ currentPath = "", baseUrl = "http://localhost/" } = {}) {
    const filename = getConfiguredAdminLoginFilename();
    const fallback = `${baseUrl.replace(/\/$/, "")}/${filename}`;
    if (!filename || filename === "admin-<unlisted-token>.html") {
        return "";
    }
    const current = String(currentPath || "").split("/").pop();
    return current === filename ? "" : fallback;
}
