import assert from "node:assert/strict";
import test from "node:test";
import { applyClientPricingOverrides, readNonNegative } from "../public/js/pro-dashboard/client-pricing.mjs";

test("client pricing overrides replace the standard rate and movement surcharge", () => {
    assert.deepEqual(applyClientPricingOverrides({
        paymentInfo: { ratePerUnit: 80 },
        movementQuote: { surcharge: 15 },
        clientRecord: { customRate: "65", movementSurcharge: "5" }
    }), { ratePerUnit: 65, surcharge: 5 });
});

test("empty or invalid overrides fall back to the professional values", () => {
    assert.deepEqual(applyClientPricingOverrides({
        paymentInfo: { ratePerUnit: 80 },
        movementQuote: { surcharge: 15 },
        clientRecord: { customRate: "", movementSurcharge: "-2" }
    }), { ratePerUnit: 80, surcharge: 15 });
    assert.equal(readNonNegative("not-a-number"), null);
});
