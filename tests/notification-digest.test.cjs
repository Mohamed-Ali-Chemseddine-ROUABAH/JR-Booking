const assert = require("node:assert/strict");
const test = require("node:test");
const { isDigestWindow, getDigestDate, buildDigestMail } = require("../functions/notification-digest.js");

test("digest window uses 08:00 Europe/Paris and the first 15 minutes", () => {
    assert.equal(isDigestWindow(new Date("2026-01-15T07:00:00.000Z")), true);
    assert.equal(isDigestWindow(new Date("2026-01-15T07:14:59.000Z")), true);
    assert.equal(isDigestWindow(new Date("2026-01-15T07:15:00.000Z")), false);
    assert.equal(isDigestWindow(new Date("2026-01-15T08:00:00.000Z")), false);
});

test("digest date follows the Paris calendar date", () => {
    assert.equal(getDigestDate(new Date("2026-01-15T23:30:00.000Z")), "2026-01-16");
});

test("digest mail is bounded and preserves notification context", () => {
    const mail = buildDigestMail([{ title: "Nouveau message" }, { body: "Répondez au client" }], "2026-01-16");
    assert.equal(mail.subject, "Résumé quotidien : 2 notifications de réservation");
    assert.match(mail.text, /2026-01-16/);
    assert.match(mail.text, /Répondez au client/);
});
