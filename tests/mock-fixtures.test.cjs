const assert = require("node:assert/strict");
const test = require("node:test");
const { buildMockFixtures } = require("./mock-fixtures.cjs");

test("builds deterministic professional, client, working-hours, and booking fixtures", () => {
    const fixtures = buildMockFixtures();
    assert.equal(fixtures.users.length, 2);
    assert.deepEqual(fixtures.proProfile.workingHours.workingDays, [1, 2, 3, 4, 5]);
    assert.equal(fixtures.bookings.length, 2);
    assert.equal(fixtures.bookings[0].status, "done");
    assert.equal(fixtures.bookings[1].status, "pending");
    assert.equal(fixtures.bookings[0].proId, fixtures.ids.professional);
    assert.equal(fixtures.bookings[0].clientId, fixtures.ids.client);
});