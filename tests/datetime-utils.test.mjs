import test from "node:test";
import assert from "node:assert/strict";
import { isLocalDateTimeRangeValid, isoToZonedLocal, zonedLocalToIso } from "../public/js/core/datetime-utils.mjs";

test("converts local professional time to an absolute ISO timestamp", () => {
    assert.equal(zonedLocalToIso("2026-01-15T09:00", "Europe/Paris"), "2026-01-15T08:00:00.000Z");
    assert.equal(zonedLocalToIso("2026-01-15T09:00", "America/New_York"), "2026-01-15T14:00:00.000Z");
});

test("round trips a local time through a timezone", () => {
    const iso = zonedLocalToIso("2026-07-15T09:30", "Europe/Paris");
    assert.equal(isoToZonedLocal(iso, "Europe/Paris"), "2026-07-15T09:30");
});

test("validates local ranges before conversion", () => {
    assert.equal(isLocalDateTimeRangeValid("2026-01-15T09:00", "2026-01-15T10:00"), true);
    assert.equal(isLocalDateTimeRangeValid("2026-01-15T10:00", "2026-01-15T09:00"), false);
    assert.equal(isLocalDateTimeRangeValid("bad", "2026-01-15T10:00"), false);
});
