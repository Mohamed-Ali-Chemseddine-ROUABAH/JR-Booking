const test = require("node:test");
const assert = require("node:assert/strict");
const {
    evaluateClaimConflict,
    getClaimTargetField,
    hashClaimValue,
    normalizeClaimEmail,
    validateClaimToken
} = require("../functions/booking-claims.js");

test("normalizes claim email and maps identity-bearing roles", () => {
    assert.equal(normalizeClaimEmail(" CLIENT@Example.COM "), "client@example.com");
    assert.equal(getClaimTargetField("primary"), "clientId");
    assert.equal(getClaimTargetField("participant"), "serviceRecipientUid");
    assert.equal(getClaimTargetField("guardian"), null);
});

test("validates a fresh token for the verified email", () => {
    assert.doesNotThrow(() => validateClaimToken({
        bookingId: "booking-1",
        emailHash: hashClaimValue("client@example.com"),
        expiresAt: new Date("2026-09-12T12:00:00Z"),
        attemptCount: 0,
        usedAt: null,
        revokedAt: null
    }, {
        bookingId: "booking-1",
        email: "CLIENT@example.com",
        now: new Date("2026-09-11T12:00:00Z")
    }));
});

test("rejects expired, used, mismatched, and exhausted tokens", () => {
    const base = {
        bookingId: "booking-1",
        emailHash: hashClaimValue("client@example.com"),
        expiresAt: new Date("2026-09-12T12:00:00Z"),
        attemptCount: 0,
        usedAt: null,
        revokedAt: null
    };
    const context = { bookingId: "booking-1", email: "client@example.com", now: new Date("2026-09-11T12:00:00Z") };
    assert.throws(() => validateClaimToken({ ...base, expiresAt: new Date("2026-09-10T12:00:00Z") }, context), { code: "claim_token_expired" });
    assert.throws(() => validateClaimToken({ ...base, usedAt: new Date() }, context), { code: "claim_token_used" });
    assert.throws(() => validateClaimToken(base, { ...context, email: "other@example.com" }), { code: "claim_email_mismatch" });
    assert.throws(() => validateClaimToken({ ...base, attemptCount: 5 }, context), { code: "claim_token_revoked" });
});

test("detects contact and role ownership conflicts", () => {
    assert.equal(evaluateClaimConflict({ booking: {}, contact: { role: "guardian", linkedUid: "other" }, uid: "client" }), "contact-linked-to-another-account");
    assert.equal(evaluateClaimConflict({ booking: { clientId: "other" }, contact: { role: "primary", linkedUid: null }, uid: "client" }), "booking-role-linked-to-another-account");
    assert.equal(evaluateClaimConflict({ booking: {}, contact: { role: "payer", linkedUid: null }, uid: "client" }), null);
});