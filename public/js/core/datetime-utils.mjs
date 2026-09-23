export function zonedLocalToIso(localValue, timezone = "Europe/Paris") {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(localValue || ""))) {
        throw new Error("invalid-datetime");
    }
    const guess = new Date(`${localValue}:00Z`);
    let result = guess;
    for (let attempt = 0; attempt < 2; attempt += 1) {
        const parts = getZonedParts(result, timezone);
        const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
        const offset = represented - result.getTime();
        result = new Date(guess.getTime() - offset);
    }
    return result.toISOString();
}

export function isoToZonedLocal(value, timezone = "Europe/Paris") {
    const date = value?.toDate ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const parts = getZonedParts(date, timezone);
    return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}T${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

export function isLocalDateTimeRangeValid(start, end) {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(start || ""))
        && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(end || ""))
        && end > start;
}

function getZonedParts(value, timezone) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(value);
    const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    return { year: Number(values.year), month: Number(values.month), day: Number(values.day), hour: Number(values.hour), minute: Number(values.minute) };
}
