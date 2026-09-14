export function calculateStatisticsMetrics(bookings, workingHours = {}, { from = "", to = "" } = {}) {
    const clientCounts = new Map();
    let bookedMinutes = 0;
    bookings.filter((booking) => booking.status !== "rejected").forEach((booking) => {
        const duration = durationMinutes(booking);
        if (duration > 0) bookedMinutes += duration;
        if (booking.clientId) clientCounts.set(booking.clientId, (clientCounts.get(booking.clientId) || 0) + 1);
    });
    const uniqueClients = clientCounts.size;
    const repeatClients = [...clientCounts.values()].filter((count) => count > 1).length;
    const range = resolveRange(bookings, from, to);
    const availableMinutes = range ? calculateAvailableMinutes(workingHours, range.start, range.end) : 0;
    return {
        bookedMinutes,
        availableMinutes,
        occupancyRate: availableMinutes ? Math.round(bookedMinutes / availableMinutes * 100) : 0,
        uniqueClients,
        repeatClients,
        retentionRate: uniqueClients ? Math.round(repeatClients / uniqueClients * 100) : 0
    };
}

export function getBookingActivityLabel(booking) {
    return String(booking.category || booking.service?.name || "Autre").trim() || "Autre";
}

export function filterStatisticsBookings(bookings, { activity = "" } = {}) {
    return activity ? bookings.filter((booking) => getBookingActivityLabel(booking) === activity) : bookings;
}

export function calculateRevenueSummary(bookings) {
    const realizedRevenue = sumResolvedPrices(bookings.filter((booking) => booking.status === "done"));
    const inProgressRevenue = sumResolvedPrices(bookings.filter((booking) => booking.status === "pending" || booking.status === "accepted"));
    return { realizedRevenue, inProgressRevenue, grossRevenue: realizedRevenue + inProgressRevenue };
}

export function filterCompletedActivityBookings(bookings) {
    return bookings.filter((booking) => booking.status === "done");
}

export function calculateTrendData(bookings, { from = "", to = "" } = {}) {
    const range = resolveRange(bookings, from, to);
    if (!range) {
        return [];
    }
    const coverage = new Map();
    const start = new Date(`${range.start}T00:00:00`);
    const end = new Date(`${range.end}T23:59:59.999`);
    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
        const iso = toIsoDate(cursor);
        coverage.set(iso, { date: iso, bookings: 0, revenue: 0 });
    }
    for (const booking of bookings) {
        const date = toDate(booking.start);
        if (!date) continue;
        const iso = toIsoDate(date);
        if (!coverage.has(iso)) continue;
        const bucket = coverage.get(iso);
        bucket.bookings += 1;
        bucket.revenue += resolveBookingPrice(booking);
    }
    return [...coverage.values()];
}

export function calculateCategoryBreakdown(bookings, { from = "", to = "" } = {}) {
    const filtered = bookings.filter((booking) => {
        if (!from && !to) return true;
        const date = toDate(booking.start);
        const iso = date ? toIsoDate(date) : "";
        return (!from || iso >= from) && (!to || iso <= to);
    });
    const categories = new Map();
    for (const booking of filtered) {
        const label = getBookingActivityLabel(booking);
        if (!label) continue;
        const current = categories.get(label) || { label, count: 0, revenue: 0 };
        current.count += 1;
        current.revenue += resolveBookingPrice(booking);
        categories.set(label, current);
    }
    return [...categories.values()].sort((left, right) => right.revenue - left.revenue || right.count - left.count || left.label.localeCompare(right.label, "fr"));
}

function sumResolvedPrices(bookings) {
    return bookings.reduce((total, booking) => total + resolveBookingPrice(booking), 0);
}

function resolveBookingPrice(booking) {
    return Number(booking.customPrice ?? booking.paymentContext?.balance ?? booking.service?.price ?? 0);
}

export function calculateReportingHighlights(trendData, categoryData) {
    const peakDay = trendData.reduce((best, item) => item.revenue > (best?.revenue ?? -Infinity) ? item : best, null);
    const totalRevenue = trendData.reduce((total, item) => total + item.revenue, 0);
    const leadingCategory = categoryData[0] || null;
    return {
        peakDay,
        averageDailyRevenue: trendData.length ? Math.round(totalRevenue / trendData.length * 100) / 100 : 0,
        leadingCategory,
        leadingCategoryShare: totalRevenue && leadingCategory ? Math.round(leadingCategory.revenue / totalRevenue * 100) : 0
    };
}

function calculateAvailableMinutes(settings, start, end) {
    const workingDays = Array.isArray(settings.workingDays) && settings.workingDays.length ? settings.workingDays : [1, 2, 3, 4, 5];
    const startMinutes = toMinutes(settings.startTime || "09:00");
    const endMinutes = toMinutes(settings.endTime || "17:00");
    const breakStart = toMinutes(settings.recurringBreak?.start || "12:00");
    const breakEnd = toMinutes(settings.recurringBreak?.end || "13:00");
    if (endMinutes <= startMinutes) return 0;
    let total = 0;
    for (const date = new Date(`${start}T00:00:00`); date <= new Date(`${end}T00:00:00`); date.setDate(date.getDate() + 1)) {
        const day = date.getDay() || 7;
        if (!workingDays.includes(day)) continue;
        total += endMinutes - startMinutes;
        if (breakEnd > breakStart && breakStart >= startMinutes && breakEnd <= endMinutes) total -= breakEnd - breakStart;
    }
    return total;
}

function resolveRange(bookings, from, to) {
    const dates = bookings.map((booking) => toDate(booking.start)).filter(Boolean).sort((left, right) => left - right);
    const start = from || (dates[0] ? toIsoDate(dates[0]) : "");
    const end = to || (dates.at(-1) ? toIsoDate(dates.at(-1)) : "");
    return start && end ? { start, end } : null;
}

function durationMinutes(booking) {
    const start = toDate(booking.start);
    const end = toDate(booking.end);
    return start && end ? Math.max(0, (end - start) / 60000) : 0;
}

function toMinutes(value) {
    const [hours, minutes] = String(value).split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
}

function toIsoDate(value) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function toDate(value) {
    if (!value) return null;
    const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
