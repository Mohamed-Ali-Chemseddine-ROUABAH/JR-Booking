const FIXTURE_IDS = {
    professional: "mock-professional",
    client: "mock-client",
    bookingDone: "mock-booking-done",
    bookingPending: "mock-booking-pending"
};

function buildMockFixtures(now = new Date("2026-09-14T10:00:00.000Z")) {
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return {
        ids: FIXTURE_IDS,
        users: [
            { uid: FIXTURE_IDS.professional, email: "mock.professional@example.test", displayName: "Mock Professional", claims: { professional: true, role: "professional" } },
            { uid: FIXTURE_IDS.client, email: "mock.client@example.test", displayName: "Mock Client", claims: { role: "client" } }
        ],
        proProfile: {
            owners: [FIXTURE_IDS.professional],
            accountStatus: "active",
            personalInfo: { displayName: "Mock Professional" },
            workingHours: { workingDays: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00", timezone: "Europe/Paris", recurringBreak: { start: "12:00", end: "13:00" } }
        },
        publicProfile: {
            owners: [FIXTURE_IDS.professional],
            displayName: "Mock Professional",
            name: "Mock Professional",
            categories: ["Consultation"],
            services: [{ name: "Consultation", durationMinutes: 60, price: 60 }],
            visibleFields: { displayName: true, categories: true, shortDescription: true },
            shortDescription: "Reusable local test professional"
        },
        clientAccount: { displayName: "Mock Client", timezone: "Europe/Paris", address: "1 rue de Test" },
        bookings: [
            { id: FIXTURE_IDS.bookingDone, proId: FIXTURE_IDS.professional, clientId: FIXTURE_IDS.client, start: now.toISOString(), end: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), status: "done", createdBy: FIXTURE_IDS.client, customPrice: 60, service: { name: "Consultation", durationMinutes: 60, price: 60 } },
            { id: FIXTURE_IDS.bookingPending, proId: FIXTURE_IDS.professional, clientId: FIXTURE_IDS.client, start: nextDay.toISOString(), end: new Date(nextDay.getTime() + 60 * 60 * 1000).toISOString(), status: "pending", createdBy: FIXTURE_IDS.client, service: { name: "Consultation", durationMinutes: 60, price: 60 } }
        ]
    };
}

module.exports = { FIXTURE_IDS, buildMockFixtures };