const assert = require("node:assert/strict");
const test = require("node:test");
const { normalizeBookingUpdateFields } = require("../functions/booking-update-validation.js");

test("normalizes service, custom price, and client message updates", () => {
    assert.deepEqual(normalizeBookingUpdateFields({ service: { name: " Consultation ", durationMinutes: "60", price: "75" }, customPrice: "80", clientMessage: " Bonjour " }), {
        service: { name: "Consultation", durationMinutes: 60, price: 75 }, customPrice: 80, clientMessage: "Bonjour"
    });
});

test("rejects unsafe booking update values", () => {
    assert.throws(() => normalizeBookingUpdateFields({ service: { name: "", durationMinutes: 0, price: -1 } }), { message: "invalid_service" });
    assert.throws(() => normalizeBookingUpdateFields({ customPrice: -1 }), { message: "invalid_custom_price" });
});