const crypto = require("node:crypto");

const CLAIM_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CLAIM_ATTEMPTS = 5;

class BookingClaimError extends Error {
    constructor(code) {
        super(code);
        this.name = "BookingClaimError";
        this.code = code;
    }
}

function normalizeClaimEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function hashClaimValue(value) {
    return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function getClaimTargetField(role) {
    if (role === "primary") return "clientId";
    if (role === "participant") return "serviceRecipientUid";
    return null;
}

function validateClaimToken(tokenData, { now = new Date(), email, bookingId } = {}) {
    if (!tokenData) throw new BookingClaimError("invalid_claim_token");
    if (tokenData.bookingId !== bookingId) throw new BookingClaimError("invalid_claim_token");
    if (tokenData.usedAt || tokenData.revokedAt) throw new BookingClaimError("claim_token_used");
    if (Number(tokenData.attemptCount || 0) >= MAX_CLAIM_ATTEMPTS) throw new BookingClaimError("claim_token_revoked");
    const expiresAt = tokenData.expiresAt?.toDate?.() || new Date(tokenData.expiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= now) throw new BookingClaimError("claim_token_expired");
    if (hashClaimValue(normalizeClaimEmail(email)) !== tokenData.emailHash) throw new BookingClaimError("claim_email_mismatch");
}

function evaluateClaimConflict({ booking, contact, uid }) {
    if (contact.linkedUid && contact.linkedUid !== uid) return "contact-linked-to-another-account";
    const targetField = getClaimTargetField(contact.role);
    if (targetField && booking[targetField] && booking[targetField] !== uid) return "booking-role-linked-to-another-account";
    return null;
}

module.exports = {
    BookingClaimError,
    CLAIM_TOKEN_TTL_MS,
    MAX_CLAIM_ATTEMPTS,
    evaluateClaimConflict,
    getClaimTargetField,
    hashClaimValue,
    normalizeClaimEmail,
    validateClaimToken
};