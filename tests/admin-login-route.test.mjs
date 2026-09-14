import test from "node:test";
import assert from "node:assert/strict";
import { normalizeAdminLoginToken, getAdminLoginFilename, getConfiguredAdminLoginUrl, getAdminLoginRedirectTarget } from "../public/js/admin/admin-login-route.mjs";

test("normalizes the hidden admin filename from the configured token", () => {
    assert.equal(normalizeAdminLoginToken(" admin-abc123 "), "abc123");
    assert.equal(getAdminLoginFilename("abc123"), "admin-abc123.html");
    assert.equal(getAdminLoginFilename("admin-abc123.html"), "admin-abc123.html");
});

test("builds the configured admin route URL from the browser token", () => {
    const previousWindow = globalThis.window;
    globalThis.window = { JR_ADMIN_LOGIN_TOKEN: "Admin-Route-42" };

    try {
        assert.equal(getConfiguredAdminLoginUrl(), "./admin-route-42.html");
    } finally {
        globalThis.window = previousWindow;
    }
});

test("builds the redirect target when the admin route is reached under the wrong filename", () => {
    const previousWindow = globalThis.window;
    globalThis.window = { JR_ADMIN_LOGIN_TOKEN: "Admin-Route-42" };

    try {
        assert.equal(getAdminLoginRedirectTarget({ currentPath: "/admin-REPLACE_WITH_UNGUESSABLE_FILENAME_TOKEN.html", baseUrl: "http://127.0.0.1:5000" }), "http://127.0.0.1:5000/admin-route-42.html");
        assert.equal(getAdminLoginRedirectTarget({ currentPath: "/admin-route-42.html", baseUrl: "http://127.0.0.1:5000" }), "");
    } finally {
        globalThis.window = previousWindow;
    }
});
