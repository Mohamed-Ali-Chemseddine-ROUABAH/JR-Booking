import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.schedule;
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export function initializeSchedule(container, { onExpandSidebar, onCreateBooking, onSelectBooking, onBookingContextMenu, daysToShow = 7, workingHours = {}, bookings = [] } = {}) {
    let selectedDays = daysToShow;
    let weekOffset = 0;
    const visibleDays = getVisibleDays(selectedDays, weekOffset);
    container.innerHTML = `
        <div class="schedule-head">
            <div class="schedule-title">
                <h1>${strings.title}</h1>
                <div class="schedule-summary">${strings.summary.replace("{days}", visibleDays.length)}</div>
            </div>
            <div class="schedule-tools">
                <button class="icon-button" type="button" aria-label="${UI_STRINGS.proDashboard.sidebar.expand}" title="${UI_STRINGS.proDashboard.sidebar.expand}" data-sidebar-expand>›</button>
                <button class="chip-button" type="button" data-navigation="previous">${strings.previous}</button>
                <button class="chip-button is-active" type="button" data-navigation="today">${strings.today}</button>
                <button class="chip-button" type="button" data-navigation="next">${strings.next}</button>
                <button class="chip-button" type="button">${strings.sync}</button>
                <div class="schedule-view-switch" role="group" aria-label="${strings.title}">
                    <button class="chip-button${daysToShow === 1 ? " is-active" : ""}" type="button" data-days="1">${strings.viewOne}</button>
                    <button class="chip-button${daysToShow === 3 ? " is-active" : ""}" type="button" data-days="3">${strings.viewThree}</button>
                    <button class="chip-button${daysToShow === 7 ? " is-active" : ""}" type="button" data-days="7">${strings.viewSeven}</button>
                </div>
            </div>
        </div>
        <div class="schedule-scroll">
            <div class="schedule-grid" role="grid" aria-label="${strings.title}">
                ${renderGrid(getVisibleDays(selectedDays, weekOffset), workingHours, bookings)}
            </div>
        </div>
    `;

    container.querySelector("[data-sidebar-expand]").addEventListener("click", onExpandSidebar);
    container.querySelectorAll("[data-days]").forEach((button) => {
        button.addEventListener("click", () => {
            container.querySelectorAll("[data-days]").forEach((item) => item.classList.remove("is-active"));
            button.classList.add("is-active");
            selectedDays = Number(button.dataset.days);
            renderScheduleGrid(container, selectedDays, weekOffset, workingHours, bookings, onCreateBooking, onSelectBooking, onBookingContextMenu);
        });
    });
    attachBookingCreation(container, onCreateBooking, onSelectBooking, onBookingContextMenu);
    container.querySelector("[data-navigation='previous']").addEventListener("click", () => {
        weekOffset -= 1;
        renderScheduleGrid(container, selectedDays, weekOffset, workingHours, bookings, onCreateBooking, onSelectBooking, onBookingContextMenu);
    });
    container.querySelector("[data-navigation='today']").addEventListener("click", () => {
        weekOffset = 0;
        renderScheduleGrid(container, selectedDays, weekOffset, workingHours, bookings, onCreateBooking, onSelectBooking, onBookingContextMenu);
    });
    container.querySelector("[data-navigation='next']").addEventListener("click", () => {
        weekOffset += 1;
        renderScheduleGrid(container, selectedDays, weekOffset, workingHours, bookings, onCreateBooking, onSelectBooking, onBookingContextMenu);
    });
    renderScheduleGrid(container, selectedDays, weekOffset, workingHours, bookings, onCreateBooking, onSelectBooking, onBookingContextMenu);
}

function renderScheduleGrid(container, daysToShow, weekOffset, workingHours, bookings, onCreateBooking, onSelectBooking, onBookingContextMenu) {
    const visibleDays = getVisibleDays(daysToShow, weekOffset);
    const grid = container.querySelector(".schedule-grid");
    grid.style.setProperty("--schedule-day-count", String(visibleDays.length));
    grid.innerHTML = renderGrid(visibleDays, workingHours, bookings);
    attachBookingCreation(container, onCreateBooking, onSelectBooking, onBookingContextMenu);
    container.querySelector(".schedule-summary").textContent = `${strings.summary.replace("{days}", visibleDays.length)} · ${formatDateRange(visibleDays)}`;
}

function renderGrid(visibleDays, workingHours, bookings) {
    const header = [`<div class="schedule-cell schedule-day" role="columnheader"></div>`]
        .concat(visibleDays.map((day) => `<div class="schedule-cell schedule-day" role="columnheader"><span>${day.label}</span><small>${day.shortDate}</small></div>`))
        .join("");

    const rows = hours.map((hour) => {
        const slots = visibleDays
            .map((day) => renderSlot(hour, day, workingHours, bookings))
            .join("");

        return `<div class="schedule-cell schedule-time" role="rowheader">${hour}</div>${slots}`;
    }).join("");

    return header + rows;
}

function renderSlot(hour, day, workingHours, bookings) {
    const dayNumber = day.date.getDay() || 7;
    const isWorkingDay = workingHours.workingDays?.includes(dayNumber) ?? true;
    const absence = (workingHours.absences || []).some((item) => item.start && item.end && day.isoDate >= item.start && day.isoDate <= item.end);
    const exception = (workingHours.exceptions || []).find((item) => item.date === day.isoDate);
    const startTime = exception?.start || workingHours.startTime || "09:00";
    const endTime = exception?.end || workingHours.endTime || "17:00";
    const isWithinHours = hour >= startTime && hour < endTime;
    const breakStart = workingHours.recurringBreak?.start || "12:00";
    const breakEnd = workingHours.recurringBreak?.end || "13:00";
    const isBreak = hour >= breakStart && hour < breakEnd;
    const booking = findBooking(bookings, day.isoDate, hour);
    const available = isWorkingDay && isWithinHours && !isBreak && !absence && !booking;
    if (booking) {
        const status = ["pending", "accepted", "done", "no-show"].includes(booking.status) ? booking.status : "pending";
        const clientLabel = escapeHtml(booking.clientDisplayName || booking.guestName || booking.guestContact?.name || strings.bookingLabel);
        return `<div class="schedule-cell schedule-slot schedule-slot-booking schedule-slot-${status}" role="gridcell" data-booking-id="${escapeHtml(booking.id)}"><strong>${clientLabel}</strong><small>${strings.bookingStatuses[status]}</small></div>`;
    }
    const label = available ? strings.emptySlot : strings.unavailableSlot;
    const className = available ? "schedule-slot" : "schedule-slot schedule-slot-unavailable";

    return `<div class="schedule-cell ${className}" role="gridcell" data-schedule-date="${day.isoDate}" data-schedule-hour="${hour}" data-available="${available}">${label}</div>`;
}

function getVisibleDays(daysToShow, weekOffset) {
    const monday = getMonday(new Date());
    monday.setDate(monday.getDate() + (weekOffset * 7));

    return Array.from({ length: daysToShow }, (_, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return {
            date,
            isoDate: toIsoDate(date),
            label: strings.days[index],
            shortDate: new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(date)
        };
    });
}

function getMonday(date) {
    const monday = new Date(date);
    const day = monday.getDay() || 7;
    monday.setDate(monday.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function toIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDateRange(days) {
    const first = days[0]?.shortDate;
    const last = days[days.length - 1]?.shortDate;
    return first === last ? first : `${first}–${last}`;
}

function findBooking(bookings, isoDate, hour) {
    return bookings.find((booking) => {
        const start = toDate(booking.start);
        return start && toIsoDate(start) === isoDate && start.getHours() === Number(hour.slice(0, 2)) && booking.status !== "rejected";
    });
}

function toDate(value) {
    if (!value) {
        return null;
    }
    if (typeof value.toDate === "function") {
        return value.toDate();
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    })[character]);
}

function attachBookingCreation(container, onCreateBooking, onSelectBooking, onBookingContextMenu) {
    container.querySelectorAll(".schedule-slot").forEach((slot) => {
        slot.addEventListener("click", () => {
            if (slot.dataset.bookingId) {
                onSelectBooking?.(slot.dataset.bookingId);
            }
        });
        slot.addEventListener("contextmenu", (event) => {
            if (!slot.dataset.bookingId) return;
            event.preventDefault();
            onBookingContextMenu?.({ bookingId: slot.dataset.bookingId, x: event.clientX, y: event.clientY });
        });
        slot.addEventListener("dblclick", () => {
            if (slot.dataset.available === "true") {
                onCreateBooking?.({ date: slot.dataset.scheduleDate, hour: slot.dataset.scheduleHour });
            }
        });
        if (slot.dataset.available === "true") {
            slot.addEventListener("mousedown", (event) => startDragSelection(event, container, slot, onCreateBooking));
        }
    });
}

function startDragSelection(startEvent, container, startSlot, onCreateBooking) {
    if (startEvent.button !== 0) {
        return;
    }
    startEvent.preventDefault();
    const date = startSlot.dataset.scheduleDate;
    const startHour = startSlot.dataset.scheduleHour;
    let hasMoved = false;
    let currentHour = startHour;

    const clearPreview = () => {
        container.querySelectorAll(".schedule-slot-drag-preview").forEach((cell) => cell.classList.remove("schedule-slot-drag-preview"));
    };

    const onMove = (event) => {
        const hoverSlot = document.elementFromPoint(event.clientX, event.clientY)?.closest(".schedule-slot");
        if (!hoverSlot || hoverSlot.dataset.scheduleDate !== date) {
            return;
        }
        hasMoved = true;
        currentHour = hoverSlot.dataset.scheduleHour;
        clearPreview();
        getAvailableRange(container, date, startHour, currentHour).forEach((hour) => {
            findScheduleSlot(container, date, hour)?.classList.add("schedule-slot-drag-preview");
        });
    };

    const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        clearPreview();
        if (hasMoved) {
            const range = getAvailableRange(container, date, startHour, currentHour);
            if (range.length > 1) {
                onCreateBooking?.({ date, hour: range[0], endHour: nextHour(range[range.length - 1]) });
            }
        }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
}

function findScheduleSlot(container, date, hour) {
    return container.querySelector(`.schedule-slot[data-schedule-date="${date}"][data-schedule-hour="${hour}"]`);
}

function getAvailableRange(container, date, startHour, hoverHour) {
    const startIndex = hours.indexOf(startHour);
    const hoverIndex = hours.indexOf(hoverHour);
    if (startIndex === -1 || hoverIndex === -1) {
        return [startHour];
    }
    const step = hoverIndex >= startIndex ? 1 : -1;
    const range = [];
    for (let index = startIndex; index >= 0 && index < hours.length; index += step) {
        const hour = hours[index];
        const slot = findScheduleSlot(container, date, hour);
        if (!slot || slot.dataset.available !== "true") {
            break;
        }
        range.push(hour);
        if (index === hoverIndex) {
            break;
        }
    }
    if (step === -1) {
        range.reverse();
    }
    return range;
}

function nextHour(hour) {
    const [hourValue, minutes] = hour.split(":").map(Number);
    return `${String(hourValue + 1).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}