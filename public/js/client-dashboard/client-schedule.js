import { UI_STRINGS } from "../core/strings-fr.js";
import { escapeHtml } from "../core/utils.js";

const strings = UI_STRINGS.clientDashboard.schedule;
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export function initializeClientSchedule(container, { bookings = [], lockedProfessional = null } = {}) {
    const visibleDays = getCurrentWeek();
    container.innerHTML = `
        <div class="client-schedule-heading">
            <div>
                <span class="eyebrow">CALENDRIER</span>
                <h1>${strings.title}</h1>
            </div>
            <span class="client-schedule-summary">${strings.summary}</span>
        </div>
        <div class="client-schedule-scroll">
            <div class="client-schedule-grid" role="grid" aria-label="${strings.title}">
                ${renderGrid(visibleDays, bookings, lockedProfessional)}
            </div>
        </div>
    `;
}

function renderGrid(days, bookings, lockedProfessional) {
    const header = `<div class="client-schedule-cell client-schedule-day"></div>${days.map((day) => `<div class="client-schedule-cell client-schedule-day"><span>${day.label}</span><small>${day.shortDate}</small></div>`).join("")}`;
    const rows = hours.map((hour) => `<div class="client-schedule-cell client-schedule-time">${hour}</div>${days.map((day) => renderSlot(day, hour, bookings, lockedProfessional)).join("")}`).join("");
    return header + rows;
}

function renderSlot(day, hour, bookings, lockedProfessional) {
    const booking = bookings.find((item) => {
        const start = toDate(item.start);
        return start && toIsoDate(start) === day.isoDate && start.getHours() === Number(hour.slice(0, 2)) && item.status !== "rejected";
    });
    if (booking) {
        const statusLabel = { pending: strings.pending, accepted: strings.accepted, done: strings.done, "no-show": strings.noShow }[booking.status] || strings.pending;
        return `<div class="client-schedule-cell client-schedule-slot is-booked"><strong>${escapeHtml(booking.proDisplayName || "Professionnel")}</strong><small>${statusLabel}</small></div>`;
    }
    if (lockedProfessional && isLockedBusy(day, hour, lockedProfessional.busySlots)) {
        return `<div class="client-schedule-cell client-schedule-slot is-locked-busy"><strong>${escapeHtml(lockedProfessional.displayName || "Professionnel")}</strong><small>${strings.locked}</small></div>`;
    }
    return `<div class="client-schedule-cell client-schedule-slot"></div>`;
}

function isLockedBusy(day, hour, busySlots = []) {
    const slotStart = new Date(`${day.isoDate}T${hour}:00`);
    const slotEnd = new Date(slotStart.getTime() + 3600000);
    return busySlots.some((slot) => {
        const busyStart = toDate(slot.start);
        const busyEnd = toDate(slot.end);
        return busyStart && busyEnd && busyStart < slotEnd && busyEnd > slotStart;
    });
}

function getCurrentWeek() {
    const monday = new Date();
    const day = monday.getDay() || 7;
    monday.setDate(monday.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return {
            isoDate: toIsoDate(date),
            label: strings.days[index],
            shortDate: new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(date)
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