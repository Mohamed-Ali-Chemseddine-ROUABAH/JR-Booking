import assert from "node:assert/strict";
import test from "node:test";
import { filterHistory } from "../public/js/pro-dashboard/client-history-filter.mjs";

const history = [
    { type: "booking", date: new Date("2026-09-15T00:30:00.000Z") },
    { type: "status", date: new Date("2026-09-15T12:00:00.000Z") },
    { type: "booking", date: new Date("2026-09-16T00:30:00.000Z") }
];

test("filters CRM history dates in the active professional timezone", () => {
    assert.equal(filterHistory(history, { date: "2026-09-14", timezone: "America/Montreal" }).length, 1);
    assert.equal(filterHistory(history, { type: "status", date: "2026-09-15", timezone: "America/Montreal" }).length, 1);
});