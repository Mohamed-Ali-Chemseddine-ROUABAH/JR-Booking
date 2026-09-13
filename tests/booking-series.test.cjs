const test = require("node:test");
const assert = require("node:assert/strict");
const { getOccurrenceRange, selectBookingOccurrences } = require("../functions/booking-series.js");

const occurrences = [
    { id: "booking-3", seriesId: "series-1", occurrenceIndex: 2 },
    { id: "booking-1", seriesId: "series-1", occurrenceIndex: 0 },
    { id: "booking-2", seriesId: "series-1", occurrenceIndex: 1 },
    { id: "other-series", seriesId: "series-2", occurrenceIndex: 0 }
];

test("selects only the requested occurrence", () => {
    assert.deepEqual(selectBookingOccurrences(occurrences, "booking-2", "this").map(({ id }) => id), ["booking-2"]);
});

test("selects the target and following occurrences in deterministic order", () => {
    assert.deepEqual(selectBookingOccurrences(occurrences, "booking-2", "this-and-following").map(({ id }) => id), ["booking-2", "booking-3"]);
});

test("selects every occurrence in the target series and excludes other series", () => {
    assert.deepEqual(selectBookingOccurrences(occurrences, "booking-2", "all-in-series").map(({ id }) => id), ["booking-1", "booking-2", "booking-3"]);
});

test("keeps a non-series booking scoped to itself", () => {
    assert.deepEqual(selectBookingOccurrences([{ id: "standalone" }], "standalone", "all-in-series").map(({ id }) => id), ["standalone"]);
});

test("rejects an unknown target or scope", () => {
    assert.throws(() => selectBookingOccurrences(occurrences, "missing", "this"), /Target booking occurrence/);
    assert.throws(() => selectBookingOccurrences(occurrences, "booking-2", "future"), /Invalid booking series scope/);
});

test("rejects a series occurrence without an index", () => {
    assert.throws(() => selectBookingOccurrences([{ id: "broken", seriesId: "series-1" }], "broken", "this-and-following"), /occurrence index/);
});

test("shifts recurring occurrence dates while preserving their relative position and duration", () => {
    const target = { id: "booking-1", seriesId: "series-1", start: "2026-10-12T09:00", end: "2026-10-12T10:00" };
    const following = { id: "booking-2", seriesId: "series-1", start: "2026-10-13T09:00", end: "2026-10-13T10:00" };
    assert.deepEqual(getOccurrenceRange(following, target, "2026-10-12T11:00", "2026-10-12T12:30"), {
        start: "2026-10-13T11:00",
        end: "2026-10-13T12:30"
    });
});