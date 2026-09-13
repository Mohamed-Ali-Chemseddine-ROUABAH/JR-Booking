const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeBookingContacts } = require("../functions/booking-contacts.js");

test("normalizes a valid booking contact set", () => {
    assert.deepEqual(normalizeBookingContacts([
        { name: " Camille ", email: " CLIENT@Example.COM ", role: "PRIMARY" },
        { name: "Parent", email: "parent@example.com", role: "guardian", notify: false }
    ]), [
        { name: "Camille", email: "client@example.com", role: "primary", notify: true },
        { name: "Parent", email: "parent@example.com", role: "guardian", notify: false }
    ]);
});

test("requires exactly one primary contact", () => {
    assert.throws(
        () => normalizeBookingContacts([{ name: "Client", email: "client@example.com", role: "payer" }]),
        { code: "invalid_primary_contact_count" }
    );
});

test("rejects duplicate normalized email and role pairs", () => {
    assert.throws(
        () => normalizeBookingContacts([
            { name: "Client", email: "client@example.com", role: "primary" },
            { name: "Client bis", email: " CLIENT@example.com ", role: "primary" }
        ]),
        { code: "duplicate_contact" }
    );
});

test("rejects more than ten contacts", () => {
    const contacts = Array.from({ length: 11 }, (_, index) => ({
        name: `Contact ${index}`,
        email: `contact-${index}@example.com`,
        role: index === 0 ? "primary" : "participant"
    }));

    assert.throws(() => normalizeBookingContacts(contacts), { code: "invalid_contact_count" });
});

test("rejects unsupported roles and invalid emails", () => {
    assert.throws(
        () => normalizeBookingContacts([{ name: "Client", email: "invalid", role: "primary" }]),
        { code: "invalid_contact_email" }
    );
    assert.throws(
        () => normalizeBookingContacts([{ name: "Client", email: "client@example.com", role: "owner" }]),
        { code: "invalid_contact_role" }
    );
});