import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCategoryQuery, filterProfilesByCategory } from "../public/js/search/category-search-utils.mjs";

test("normalizes category queries across accents and spaces", () => {
    assert.equal(normalizeCategoryQuery("  Physiothérapie  "), "physiotherapie");
    assert.equal(normalizeCategoryQuery("Massage\t/\nSport"), "massage sport");
});

test("matches public profiles by category name regardless of case or accents", () => {
    const profiles = [
        { id: "pro-1", categories: ["Physiothérapie", "Bien-être"] },
        { id: "pro-2", categories: ["Massage / Relaxation", "Sport"] },
        { id: "pro-3", categories: ["Coaching"] }
    ];

    const matches = filterProfilesByCategory("physiotherapie", profiles).map((profile) => profile.id);
    assert.deepEqual(matches, ["pro-1"]);

    const massageMatches = filterProfilesByCategory("Massage Sport", profiles).map((profile) => profile.id);
    assert.deepEqual(massageMatches, ["pro-2"]);
});
