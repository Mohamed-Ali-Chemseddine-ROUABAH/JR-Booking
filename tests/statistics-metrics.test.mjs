import assert from "node:assert/strict";
import test from "node:test";
import { calculateStatisticsMetrics, calculateTrendData, calculateCategoryBreakdown, calculateReportingHighlights, calculateRevenueSummary, filterCompletedActivityBookings, filterStatisticsBookings } from "../public/js/pro-dashboard/statistics-metrics.mjs";

const workingHours = { workingDays: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00", recurringBreak: { start: "12:00", end: "13:00" } };

test("calculates occupancy and repeat-client retention for the filtered range", () => {
    const metrics = calculateStatisticsMetrics([
        { clientId: "one", status: "done", start: "2026-09-14T09:00:00", end: "2026-09-14T10:00:00" },
        { clientId: "one", status: "accepted", start: "2026-09-15T10:00:00", end: "2026-09-15T11:00:00" },
        { clientId: "two", status: "rejected", start: "2026-09-15T11:00:00", end: "2026-09-15T12:00:00" }
    ], workingHours, { from: "2026-09-14", to: "2026-09-15" });

    assert.equal(metrics.bookedMinutes, 120);
    assert.equal(metrics.availableMinutes, 840);
    assert.equal(metrics.occupancyRate, 14);
    assert.equal(metrics.uniqueClients, 1);
    assert.equal(metrics.repeatClients, 1);
    assert.equal(metrics.retentionRate, 100);
});

test("returns zero occupancy and retention without usable data", () => {
    assert.deepEqual(calculateStatisticsMetrics([], workingHours), {
        bookedMinutes: 0,
        availableMinutes: 0,
        occupancyRate: 0,
        uniqueClients: 0,
        repeatClients: 0,
        retentionRate: 0
    });
});

test("builds a daily revenue trend and category breakdown for filtered bookings", () => {
    const bookings = [
        { clientId: "one", status: "done", start: "2026-09-14T09:00:00", end: "2026-09-14T10:00:00", service: { name: "Consultation", price: 60 } },
        { clientId: "two", status: "done", start: "2026-09-14T11:00:00", end: "2026-09-14T12:00:00", service: { name: "Massage", price: 90 } },
        { clientId: "three", status: "accepted", start: "2026-09-15T09:00:00", end: "2026-09-15T10:30:00", service: { name: "Consultation", price: 75 } },
        { clientId: "four", status: "rejected", start: "2026-09-15T10:30:00", end: "2026-09-15T12:00:00", service: { name: "Massage", price: 100 } }
    ];

    const trend = calculateTrendData(bookings, { from: "2026-09-14", to: "2026-09-15" });
    assert.deepEqual(trend, [
        { date: "2026-09-14", bookings: 2, revenue: 150 },
        { date: "2026-09-15", bookings: 2, revenue: 175 }
    ]);

    const categories = calculateCategoryBreakdown(bookings, { from: "2026-09-14", to: "2026-09-15" });
    assert.deepEqual(categories, [
        { label: "Massage", count: 2, revenue: 190 },
        { label: "Consultation", count: 2, revenue: 135 }
    ]);

    assert.deepEqual(calculateReportingHighlights(trend, categories), {
        peakDay: { date: "2026-09-15", bookings: 2, revenue: 175 },
        averageDailyRevenue: 162.5,
        leadingCategory: { label: "Massage", count: 2, revenue: 190 },
        leadingCategoryShare: 58
    });
});

test("filters statistics by resolved activity type", () => {
    const bookings = [
        { service: { name: "Consultation" }, status: "done" },
        { category: "Massage", service: { name: "Relaxation" }, status: "accepted" },
        { service: { name: "Consultation" }, status: "rejected" }
    ];

    assert.deepEqual(filterStatisticsBookings(bookings, { activity: "Consultation" }), [bookings[0], bookings[2]]);
    assert.deepEqual(filterStatisticsBookings(bookings, { activity: "Massage" }), [bookings[1]]);
});

test("summarizes realized, in-progress, and gross revenue without rejected activity", () => {
    assert.deepEqual(calculateRevenueSummary([
        { status: "done", customPrice: 100 },
        { status: "accepted", service: { price: 40 } },
        { status: "pending", paymentContext: { balance: 20 } },
        { status: "rejected", customPrice: 999 },
        { status: "no-show", customPrice: 50 }
    ]), { realizedRevenue: 100, inProgressRevenue: 60, grossRevenue: 160 });
});

test("limits activity reports to completed bookings", () => {
    const done = { status: "done", customPrice: 60 };
    assert.deepEqual(filterCompletedActivityBookings([done, { status: "accepted", customPrice: 80 }, { status: "rejected", customPrice: 90 }]), [done]);
});
