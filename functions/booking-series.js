const SERIES_SCOPES = new Set(["this", "this-and-following", "all-in-series"]);

function selectBookingOccurrences(occurrences, targetBookingId, scope) {
    if (!Array.isArray(occurrences)) throw new TypeError("Occurrences must be an array.");
    if (!targetBookingId || !SERIES_SCOPES.has(scope)) throw new Error("Invalid booking series scope.");

    const target = occurrences.find((occurrence) => occurrence.id === targetBookingId);
    if (!target) throw new Error("Target booking occurrence was not found.");

    const targetSeriesId = target.seriesId || null;
    const seriesOccurrences = targetSeriesId
        ? occurrences.filter((occurrence) => occurrence.seriesId === targetSeriesId)
        : [target];
    if (targetSeriesId && !Number.isInteger(target.occurrenceIndex)) throw new Error("Series occurrence index is required.");
    const sorted = seriesOccurrences
        .slice()
        .sort((left, right) => (left.occurrenceIndex ?? 0) - (right.occurrenceIndex ?? 0) || left.id.localeCompare(right.id));

    if (scope === "this" || !targetSeriesId) return [target];
    if (scope === "all-in-series") return sorted;
    return sorted.filter((occurrence) => Number.isInteger(occurrence.occurrenceIndex) && occurrence.occurrenceIndex >= target.occurrenceIndex);
}

function getOccurrenceRange(occurrence, targetOccurrence, requestedStart, requestedEnd) {
    if (!occurrence.seriesId || occurrence.id === targetOccurrence.id) return { start: requestedStart, end: requestedEnd };
    const targetStart = new Date(targetOccurrence.start);
    const occurrenceStart = new Date(occurrence.start);
    const nextStart = new Date(requestedStart);
    const nextEnd = new Date(requestedEnd);
    if ([targetStart, occurrenceStart, nextStart, nextEnd].some((date) => Number.isNaN(date.getTime()))) {
        throw new Error("Valid occurrence dates are required.");
    }
    const duration = nextEnd.getTime() - nextStart.getTime();
    const shiftedStart = new Date(occurrenceStart.getTime() + nextStart.getTime() - targetStart.getTime());
    const shiftedEnd = new Date(shiftedStart.getTime() + duration);
    return { start: toDateTimeLocal(shiftedStart), end: toDateTimeLocal(shiftedEnd) };
}

function toDateTimeLocal(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

module.exports = { SERIES_SCOPES, getOccurrenceRange, selectBookingOccurrences };