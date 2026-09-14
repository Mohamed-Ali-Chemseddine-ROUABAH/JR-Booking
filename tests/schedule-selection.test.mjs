import assert from "node:assert/strict";
import test from "node:test";
import { buildFixedBookingDetails, toggleFixedSlotSelection } from "../public/js/schedule/schedule-selection.mjs";

test("limits fixed-slot selection to one day and the configured cap", () => {
    const first = { date: "2026-09-14", hour: "09:00" };
    const second = { date: "2026-09-14", hour: "10:00" };
    assert.deepEqual(toggleFixedSlotSelection([], first, 2), [first]);
    assert.deepEqual(toggleFixedSlotSelection([first], second, 2), [first, second]);
    assert.deepEqual(toggleFixedSlotSelection([first, second], { date: "2026-09-14", hour: "11:00" }, 2), [first, second]);
    assert.deepEqual(toggleFixedSlotSelection([first], { date: "2026-09-15", hour: "09:00" }, 2), [first]);
});

test("builds one fixed booking range from selected slots", () => {
    assert.deepEqual(buildFixedBookingDetails([{ date: "2026-09-14", hour: "09:00" }, { date: "2026-09-14", hour: "10:00" }], 30), {
        date: "2026-09-14", hour: "09:00", endHour: "10:00", slotCount: 2
    });
});