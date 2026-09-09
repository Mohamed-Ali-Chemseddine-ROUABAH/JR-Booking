import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCustomPaymentLinks } from "../public/js/core/payment-links.js";

test("normalizes multiple custom payment links", () => {
    assert.deepEqual(normalizeCustomPaymentLinks({
        customPaymentLinks: [{ label: "  Lydia ", url: " https://pay.example/lydia " }, { label: "", url: "" }]
    }), [{ label: "Lydia", url: "https://pay.example/lydia" }]);
});

test("falls back to legacy custom payment fields", () => {
    assert.deepEqual(normalizeCustomPaymentLinks({
        customBankName: "Ancien lien",
        customBankUrl: "https://pay.example/legacy"
    }), [{ label: "Ancien lien", url: "https://pay.example/legacy" }]);
});