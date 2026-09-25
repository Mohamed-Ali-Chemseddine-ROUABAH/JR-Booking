import { UI_STRINGS } from "../core/strings-fr.js?v=mockup-parity-b-20260924";
import { escapeHtml } from "../core/utils.js";

const strings = UI_STRINGS.clientDashboard.schedule;
const hours = Array.from({ length: 10 }, (_, index) => `${String(8 + index).padStart(2, "0")}:00`);

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
            <div class="legend-mini" aria-hidden="true">
                <span><i class="legend-swatch acc"></i>${strings.accepted}</span>
                <span><i class="legend-swatch pen"></i>${strings.pending}</span>
                <span><i class="legend-swatch rej"></i>${strings.noShow}</span>
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
    const header = `<div class="client-schedule-cell client-schedule-day"></div>${days.map((day) => `<div class="client-schedule-cell client-schedule-day${day.isToday ? " is-today" : ""}"><span>${day.label}</span><small>${day.shortDate}</small></div>`).join("")}`;
    const rows = hours.map((hour) => `<div class="client-schedule-cell client-schedule-time">${hour}</div>${days.map((day) => renderSlot(day, hour, bookings, lockedProfessional, timezone)).join("")}`).join("");
    return header + rows;
}

function renderSlot(day, hour, bookings, lockedProfessional, timezone) {
    const todayClass = day.isToday ? " is-today" : "";
    const booking = bookings.find((item) => isBookingActiveAtHour(item, day.isoDate, hour, timezone));
    if (booking) {
        const statusKey = ["pending", "accepted", "done", "no-show"].includes(booking.status) ? booking.status : "pending";
        const statusLabel = { pending: strings.pending, accepted: strings.accepted, done: strings.done, "no-show": strings.noShow }[statusKey];
        const isStart = isBookingStart(booking, day.isoDate, hour, timezone);
        const continues = bookingContinuesPastSlot(booking, day.isoDate, hour, timezone);
        const joinClass = `${isStart ? "" : " is-continuation"}${continues ? " has-continuation" : ""}`;
        const proLabel = escapeHtml(booking.proDisplayName || "Professionnel");
        return `<div class="client-schedule-cell client-schedule-slot is-occupied${todayClass}" aria-label="${escapeHtml(isStart ? booking.proDisplayName || "Professionnel" : statusLabel)}" title="${escapeHtml(`${booking.proDisplayName || "Professionnel"} \u00b7 ${statusLabel}`)}"><span class="client-schedule-block is-${statusKey}${joinClass}">${isStart ? `<strong>${proLabel}</strong><small>${formatSlotRange(booking, timezone)}</small>` : ""}</span></div>`;
    }
    if (lockedProfessional && isLockedBusy(day, hour, lockedProfessional.busySlots, timezone)) {
        return `<div class="client-schedule-cell client-schedule-slot is-occupied${todayClass}"><span class="client-schedule-block is-locked-busy"><strong>${escapeHtml(lockedProfessional.displayName || "Professionnel")}</strong><small>${strings.locked}</small></span></div>`;
    }
    if (lockedProfessional) {
        return `<button class="client-schedule-cell client-schedule-slot is-occupied${todayClass}" type="button" data-locked-slot data-date="${day.isoDate}" data-start="${hour}" data-end="${addMinutesToHour(hour, 60)}"><span class="client-schedule-block is-locked-available"><strong>${strings.available}</strong><small>${escapeHtml(lockedProfessional.displayName || "Professionnel")}</small></span></button>`;
    }
    return `<div class="client-schedule-cell client-schedule-slot${todayClass}"></div>`;
}

function bookingContinuesPastSlot(booking, isoDate, hour, timezone) {
    const end = toDate(booking.end) || toDate(booking.start);
    if (!end) return false;
    return toMinuteKey(getZonedParts(end, timezone)) > `${isoDate}T${addMinutesToHour(hour, 60)}`;
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
            isToday: toIsoDate(date) === now.date,
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
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(value);
    const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    return { date: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour), minute: Number(values.minute) };
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
    const slotStart = `${isoDate}T${hour}`;
    const slotEnd = `${isoDate}T${addMinutesToHour(hour, 60)}`;
    return toMinuteKey(startParts) < slotEnd && toMinuteKey(endParts) > slotStart;
}

function toMinuteKey(parts) {
    return `${parts.date}T${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

function formatSlotRange(booking, timezone) {
    const start = toDate(booking.start);
    const end = toDate(booking.end) || start;
    if (!start || !end) return "";
    return `${toMinuteKey(getZonedParts(start, timezone)).slice(11)}\u2013${toMinuteKey(getZonedParts(end, timezone)).slice(11)}`;
}

function isBookingStart(booking, isoDate, hour, timezone) {
    const start = toDate(booking.start);
    const parts = start ? getZonedParts(start, timezone) : null;
    return parts?.date === isoDate && parts.hour === Number(hour.slice(0, 2));
}