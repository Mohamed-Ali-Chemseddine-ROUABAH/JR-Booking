import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRequestFields } from "../public/js/shared/support-request-policy.mjs";
import { buildRequesterReplyNotification, hasNewAdminReply } from "../functions/support-request-notifications.js";
import { buildBanReviewNotification, hasBanReviewChange } from "../functions/ban-request-notifications.js";

test("builds a bounded pending request payload", () => {
    const payload = normalizeRequestFields({
        subject: "  Need help  ",
        details: "  The schedule does not refresh.  ",
        createdBy: "user-1"
    });

    assert.equal(payload.subject, "Need help");
    assert.equal(payload.details, "The schedule does not refresh.");
    assert.equal(payload.createdBy, "user-1");
    assert.equal(payload.status, "pending");
});

test("rejects incomplete requests", () => {
    assert.throws(() => normalizeRequestFields({ subject: "", details: "details", createdBy: "user-1" }), /invalid-request/);
    assert.throws(() => normalizeRequestFields({ subject: "subject", details: "", createdBy: "user-1" }), /invalid-request/);
    assert.throws(() => normalizeRequestFields({ subject: "subject", details: "details", createdBy: "" }), /invalid-request/);
});

test("builds bounded support and data-request reply notifications", () => {
    const support = buildRequesterReplyNotification({ kind: "support", requestId: "ticket-1", reply: "Support reply".repeat(100) });
    const data = buildRequesterReplyNotification({ kind: "data-request", requestId: "request-1", reply: "Data reply" });

    assert.equal(support.type, "support-ticket-reply");
    assert.equal(support.ticketId, "ticket-1");
    assert.equal(support.body.length, 160);
    assert.equal(data.type, "data-request-reply");
    assert.equal(data.requestId, "request-1");
    assert.equal(data.body, "Data reply");
    assert.equal(support.readAt, null);
});

test("only new replies trigger requester notifications", () => {
    assert.equal(hasNewAdminReply({ adminReply: "old" }, { createdBy: "user-1", adminReply: "new" }), true);
    assert.equal(hasNewAdminReply({ adminReply: "same" }, { createdBy: "user-1", adminReply: "same" }), false);
    assert.equal(hasNewAdminReply({}, { createdBy: "user-1" }), false);
});

test("builds ban-review notifications only for reviewed escalations", () => {
    const approved = buildBanReviewNotification({ recordId: "pro-client-1", status: "approved" });
    const rejected = buildBanReviewNotification({ recordId: "pro-client-1", status: "rejected" });
    assert.equal(approved.type, "platform-ban-approved");
    assert.equal(rejected.type, "platform-ban-rejected");
    assert.equal(hasBanReviewChange({ platformBanRequest: { status: "pending" } }, { platformBanRequest: { status: "rejected", requestedBy: "pro-1" } }), true);
    assert.equal(hasBanReviewChange({ platformBanRequest: { status: "rejected" } }, { platformBanRequest: { status: "rejected", requestedBy: "pro-1" } }), false);
});
