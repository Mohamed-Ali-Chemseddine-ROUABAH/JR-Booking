import assert from "node:assert/strict";
import test from "node:test";
import { buildPublicScheduleSettings, normalizeScheduleSettings } from "../public/js/schedule/schedule-settings.mjs";

test("normalizes fixed-slot schedule settings within safe bounds", () => {
    assert.deepEqual(normalizeScheduleSettings({ method: "fixed", slotDurationMinutes: 30, maxSlots: 3, maxRecurrences: 12, activationMode: "from-date", activationDate: "2026-10-01" }), {
        method: "fixed", slotDurationMinutes: 30, allowMultipleSlots: false, maxSlots: 3, recurrenceAllowed: false, maxRecurrences: 12, activationMode: "from-date", activationDate: "2026-10-01"
    });
});

test("falls back from invalid schedule settings", () => {
    const settings = normalizeScheduleSettings({ method: "unknown", slotDurationMinutes: 1, maxSlots: 100, maxRecurrences: 0, activationMode: "invalid" });
    assert.equal(settings.method, "drag");
    assert.equal(settings.slotDurationMinutes, 15);
    assert.equal(settings.maxSlots, 20);
    assert.equal(settings.maxRecurrences, 1);
    assert.equal(settings.activationMode, "permanent");
});

test("builds a safe public schedule projection without private settings", () => {
    const projection = buildPublicScheduleSettings({ workingDays: [1, 6, 9], startTime: "10:00", endTime: "16:00", address: "private", absences: [{ reason: "private" }], scheduleSettings: { method: "fixed", slotDurationMinutes: 30 } });
    assert.deepEqual(projection.workingDays, [1, 6]);
    assert.equal(projection.startTime, "10:00");
    assert.equal(projection.scheduleSettings.method, "fixed");
    assert.equal("address" in projection, false);
    assert.equal("absences" in projection, false);
});