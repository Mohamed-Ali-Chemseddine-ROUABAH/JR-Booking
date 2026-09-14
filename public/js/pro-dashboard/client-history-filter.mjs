export function filterHistory(history, { type = "", date = "", timezone = "Europe/Paris" } = {}) {
    return history.filter((item) => (!type || item.type === type) && (!date || dateKey(item.date, timezone) === date));
}

function dateKey(value, timezone) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: timezone }).format(date);
}