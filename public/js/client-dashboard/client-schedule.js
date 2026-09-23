import { UI_STRINGS } from "../core/strings-fr.js";
import { escapeHtml } from "../core/utils.js";

const strings = UI_STRINGS.clientDashboard.schedule;
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export function initializeClientSchedule(container, { bookings = [], lockedProfessional = null, timezone = "Europe/Paris", onLockedSlotSelect } = {}) {
    let weekOffset = 0;
    const render = () => {
        const visibleDays = getCurrentWeek(timezone, weekOffset);
        container.innerHTML = `
            <div class="schedule-head client-schedule-heading">
                <div>
                    <span class="eyebrow">CALENDRIER</span>
                    <h1>${strings.title}</h1>
                </div>
                <div class="schedule-tools client-schedule-tools">
                    <button class="icon-button schedule-nav-button" type="button" data-client-navigation="previous" aria-label="${strings.previous}" title="${strings.previous}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg></button>
                    <button class="chip-button" type="button" data-client-navigation="today">${strings.today}</button>
                    <button class="icon-button schedule-nav-button" type="button" data-client-navigation="next" aria-label="${strings.next}" title="${strings.next}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg></button>
                </div>
                <span class="schedule-summary client-schedule-summary">${formatDateRange(visibleDays)}</span>
            </div>
            <div class="client-schedule-scroll">
                <div class="client-schedule-grid" role="grid" aria-label="${strings.title}">
                    ${renderGrid(visibleDays, bookings, lockedProfessional, timezone)}
                </div>
            </div>
        `;
        container.querySelector("[data-client-navigation='previous']").addEventListener("click", () => { weekOffset -= 1; render(); });
        container.querySelector("[data-client-navigation='today']").addEventListener("click", () => { weekOffset = 0; render(); });
        container.querySelector("[data-client-navigation='next']").addEventListener("click", () => { weekOffset += 1; render(); });
        container.querySelectorAll("[data-locked-slot]").forEach((slot) => slot.addEventListener("click", () => onLockedSlotSelect?.({ date: slot.dataset.date, start: slot.dataset.start, end: slot.dataset.end, proId: lockedProfessional?.proId })));
    };
    render();
}

function renderGrid(days, bookings, lockedProfessional, timezone) {
    const header = `<div class="client-schedule-cell client-schedule-day"></div>${days.map((day) => `<div class="client-schedule-cell client-schedule-day"><span>${day.label}</span><small>${day.shortDate}</small></div>`).join("")}`;
    const rows = hours.map((hour) => `<div class="client-schedule-cell client-schedule-time">${hour}</div>${days.map((day) => renderSlot(day, hour, bookings, lockedProfessional, timezone)).join("")}`).join("");
    return header + rows;
}

function renderSlot(day, hour, bookings, lockedProfessional, timezone) {
    const booking = bookings.find((item) => isBookingActiveAtHour(item, day.isoDate, hour, timezone));
    if (booking) {
        const statusLabel = { pending: strings.pending, accepted: strings.accepted, done: strings.done, "no-show": strings.noShow }[booking.status] || strings.pending;
        const isStart = isBookingStart(booking, day.isoDate, hour, timezone);
        return `<div class="client-schedule-cell client-schedule-slot is-booked${isStart ? "" : " is-booking-continuation"}" aria-label="${escapeHtml(isStart ? booking.proDisplayName || "Professionnel" : statusLabel)}">${isStart ? `<strong>${escapeHtml(booking.proDisplayName || "Professionnel")}</strong><small>${statusLabel}</small>` : ""}</div>`;
    }
    if (lockedProfessional && isLockedBusy(day, hour, lockedProfessional.busySlots, timezone)) {
        return `<div class="client-schedule-cell client-schedule-slot is-locked-busy"><strong>${escapeHtml(lockedProfessional.displayName || "Professionnel")}</strong><small>${strings.locked}</small></div>`;
    }
    if (lockedProfessional) {
        return `<button class="client-schedule-cell client-schedule-slot is-locked-available" type="button" data-locked-slot data-date="${day.isoDate}" data-start="${hour}" data-end="${addMinutesToHour(hour, 60)}"><strong>${strings.available}</strong><small>${escapeHtml(lockedProfessional.displayName || "Professionnel")}</small></button>`;
    }
    return `<div class="client-schedule-cell client-schedule-slot"></div>`;
}

function addMinutesToHour(hour, minutes) {
    const [hours, currentMinutes] = hour.split(":").map(Number);
    const total = hours * 60 + currentMinutes + minutes;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function isLockedBusy(day, hour, busySlots = [], timezone) {
    return busySlots.some((slot) => {
        const busyStart = toDate(slot.start);
        const busyEnd = toDate(slot.end);
        if (!busyStart || !busyEnd) return false;
        const start = getZonedParts(busyStart, timezone);
        const end = getZonedParts(busyEnd, timezone);
        return start.date === day.isoDate && start.hour <= Number(hour.slice(0, 2)) && (end.date > day.isoDate || end.hour > Number(hour.slice(0, 2)));
    });
}

function getCurrentWeek(timezone, weekOffset = 0) {
    const now = getZonedParts(new Date(), timezone);
    const monday = new Date(`${now.date}T00:00:00`);
    const day = monday.getDay() || 7;
    monday.setDate(monday.getDate() - day + 1);
    monday.setDate(monday.getDate() + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return {
            isoDate: toIsoDate(date),
            label: strings.days[index],
            shortDate: formatIsoShortDate(toIsoDate(date))
        };
    });
}

function toIsoDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toDate(value) {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getZonedParts(value, timezone) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(value);
    const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    return { date: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour) };
}

function formatIsoShortDate(isoDate) {
    return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(new Date(`${isoDate}T12:00:00Z`));
}

function formatDateRange(days) {
    const first = days[0]?.shortDate;
    const last = days[days.length - 1]?.shortDate;
    return first === last ? first : `${first}–${last}`;
}

function isBookingActiveAtHour(booking, isoDate, hour, timezone) {
    if (booking.status === "rejected") return false;
    const start = toDate(booking.start);
    const end = toDate(booking.end) || start;
    const startParts = start ? getZonedParts(start, timezone) : null;
    const endParts = end ? getZonedParts(end, timezone) : null;
    if (!startParts || !endParts) return false;
    const slotKey = `${isoDate}T${hour}`;
    return slotKey >= `${startParts.date}T${String(startParts.hour).padStart(2, "0")}:00`
        && slotKey < `${endParts.date}T${String(endParts.hour).padStart(2, "0")}:00`;
}

function isBookingStart(booking, isoDate, hour, timezone) {
    const start = toDate(booking.start);
    const parts = start ? getZonedParts(start, timezone) : null;
    return parts?.date === isoDate && parts.hour === Number(hour.slice(0, 2));
}