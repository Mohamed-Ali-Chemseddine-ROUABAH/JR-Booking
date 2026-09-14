import assert from "node:assert/strict";
import test from "node:test";
import { buildProfessionalDataExport } from "../public/js/shared/export-data.js";

test("builds a local professional export with only authorized booking fields", () => {
    const result = buildProfessionalDataExport({
        user: { uid: "pro-1", email: "pro@example.test", displayName: "Pro Test", accessToken: "secret" },
        profileId: "profile-1",
        bookings: [{
            id: "booking-1",
            proId: "profile-1",
            clientId: "client-1",
            start: "2026-09-14T09:00:00",
            end: "2026-09-14T10:00:00",
            status: "done",
            customPrice: 60,
            paymentContext: { balance: 60 },
            createdBy: "pro-1",
            privateNote: "do not export"
        }]
    });

    assert.deepEqual(result.account, { uid: "pro-1", email: "pro@example.test", displayName: "Pro Test" });
    assert.equal(result.profileId, "profile-1");
    assert.deepEqual(result.bookings[0], {
        id: "booking-1",
        proId: "profile-1",
        clientId: "client-1",
        start: "2026-09-14T09:00:00",
        end: "2026-09-14T10:00:00",
        status: "done",
        service: undefined,
        customPrice: 60,
        paymentContext: { balance: 60 },
        createdBy: "pro-1"
    });
    assert.doesNotMatch(JSON.stringify(result), /secret|privateNote/);
});
