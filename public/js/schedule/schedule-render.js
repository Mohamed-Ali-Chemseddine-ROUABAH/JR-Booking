import { UI_STRINGS } from "../core/strings-fr.js?v=mockup-parity-b-20260924";
import { normalizeScheduleSettings } from "./schedule-settings.mjs";
import { buildFixedBookingDetails, toggleFixedSlotSelection } from "./schedule-selection.mjs";

const strings = UI_STRINGS.proDashboard.schedule;
const DEFAULT_BAND = { start: 8, end: 18 };

/** Hour rows spanning the professional's working day, padded one hour either side like the mockup. */
function buildHours(workingHours) {
    const starts = [workingHours.startTime, ...(workingHours.exceptions || []).map((item) => item.start)].filter(Boolean);
    const ends = [workingHours.endTime, ...(workingHours.exceptions || []).map((item) => item.end)].filter(Boolean);
    const first = Math.max(0, Math.min(DEFAULT_BAND.start, ...starts.map((value) => Number(String(value).slice(0, 2)))));
    const last = Math.min(24, Math.max(DEFAULT_BAND.end, ...ends.map((value) => Number(String(value).slice(0, 2)) + 1)));
    return Array.from({ length: Math.max(1, last - first) }, (_, index) => `${String(first + index).padStart(2, "0")}:00`);
}

export function initializeSchedule(container, { onExpandSidebar, onCreateBooking, onSelectBooking, onBookingContextMenu, onCalendarSync, onCalendarRangeChange, daysToShow = 7, timezone = "Europe/Paris", workingHours = {}, bookings = [], calendarEvents = [] } = {}) {
    let selectedDays = daysToShow;
    let weekOffset = 0;
    const visibleDays = getVisibleDays(selectedDays, weekOffset, timezone);
    container.innerHTML = `
        <div class="schedule-head">
            <div class="schedule-title">
                <h1>${strings.title}</h1>
                <div class="schedule-summary">${strings.summary.replace("{days}", visibleDays.length)}</div>
            </div>
            <div class="schedule-tools">
                <button class="icon-button" type="button" aria-label="${UI_STRINGS.proDashboard.sidebar.expand}" title="${UI_STRINGS.proDashboard.sidebar.expand}" data-sidebar-expand><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg></button>
                <button class="icon-button schedule-nav-button" type="button" data-navigation="previous" aria-label="${strings.previous}" title="${strings.previous}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg></button>
                <button class="chip-button is-active" type="button" data-navigation="today">${strings.today}</button>
                <button class="icon-button schedule-nav-button" type="button" data-navigation="next" aria-label="${strings.next}" title="${strings.next}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg></button>
                <button class="chip-button" type="button" data-calendar-sync>${strings.sync}</button>
                <span class="tag-pill schedule-sync-state" data-calendar-state hidden></span>
                <div class="schedule-view-switch" role="group" aria-label="${strings.title}">
                    <button class="chip-button${daysToShow === 1 ? " is-active" : ""}" type="button" data-days="1">${strings.viewOne}</button>
                    <button class="chip-button${daysToShow === 3 ? " is-active" : ""}" type="button" data-days="3">${strings.viewThree}</button>
                    <button class="chip-button${daysToShow === 7 ? " is-active" : ""}" type="button" data-days="7">${strings.viewSeven}</button>
                </div>
            </div>
        </div>
        <div class="legend-mini" aria-hidden="true">
            <span><i class="legend-swatch acc"></i>${strings.legend.accepted}</span>
            <span><i class="legend-swatch pen"></i>${strings.legend.pending}</span>
            <span><i class="legend-swatch rej"></i>${strings.legend.rejected}</span>
            <span><i class="legend-swatch ext"></i>${strings.legend.external}</span>
            <span><i class="legend-swatch brk"></i>${strings.legend.brk}</span>
        </div>
        <div class="schedule-scroll">
            <div class="schedule-grid" role="grid" aria-label="${strings.title}">
                ${renderGrid(getVisibleDays(selectedDays, weekOffset, timezone), workingHours, bookings, calendarEvents, timezone)}
            </div>
        </div>
        <p class="week-note"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 11v5m0-8.2v.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg>${strings.weekNote}</p>
    `;

    container.querySelector("[data-sidebar-expand]").addEventListener("click", onExpandSidebar);
    container.querySelector("[data-calendar-sync]").addEventListener("click", onCalendarSync);
    container.querySelectorAll("[data-days]").forEach((button) => {
        button.addEventListener("click", () => {
            container.querySelectorAll("[data-days]").forEach((item) => item.classList.remove("is-active"));
            button.classList.add("is-active");
            selectedDays = Number(button.dataset.days);
            refreshCalendarRange();
        });
    });
    container.querySelector("[data-navigation='previous']").addEventListener("click", () => {
        weekOffset -= 1;
        refreshCalendarRange();
    });
    container.querySelector("[data-navigation='today']").addEventListener("click", () => {
        weekOffset = 0;
        refreshCalendarRange();
    });
    container.querySelector("[data-navigation='next']").addEventListener("click", () => {
        weekOffset += 1;
        refreshCalendarRange();
    });
    renderScheduleGrid(container, selectedDays, weekOffset, workingHours, bookings, calendarEvents, timezone, onCreateBooking, onSelectBooking, onBookingContextMenu);

    async function refreshCalendarRange() {
        const visibleDays = getVisibleDays(selectedDays, weekOffset, timezone);
        if (onCalendarRangeChange) {
            calendarEvents = await onCalendarRangeChange({ from: visibleDays[0].date, to: endOfDay(visibleDays[visibleDays.length - 1].date) });
        }
        renderScheduleGrid(container, selectedDays, weekOffset, workingHours, bookings, calendarEvents, timezone, onCreateBooking, onSelectBooking, onBookingContextMenu);
    }
}

function endOfDay(date) {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
}

function renderScheduleGrid(container, daysToShow, weekOffset, workingHours, bookings, calendarEvents, timezone, onCreateBooking, onSelectBooking, onBookingContextMenu) {
    const visibleDays = getVisibleDays(daysToShow, weekOffset, timezone);
    const grid = container.querySelector(".schedule-grid");
    grid.style.setProperty("--schedule-day-count", String(visibleDays.length));
    grid.innerHTML = renderGrid(visibleDays, workingHours, bookings, calendarEvents, timezone);
    const syncState = container.querySelector("[data-calendar-state]");
    syncState.hidden = !calendarEvents.length;
    syncState.textContent = strings.syncState.replace("{count}", calendarEvents.length);
    attachBookingCreation(container, onCreateBooking, onSelectBooking, onBookingContextMenu, normalizeScheduleSettings(workingHours.scheduleSettings));
    container.querySelector(".schedule-summary").textContent = `${strings.summary.replace("{days}", visibleDays.length)} · ${formatDateRange(visibleDays)}`;
}

function renderGrid(visibleDays, workingHours, bookings, calendarEvents, timezone) {
    const header = [`<div class="schedule-cell schedule-day" role="columnheader"></div>`]
        .concat(visibleDays.map((day) => `<div class="schedule-cell schedule-day${day.isToday ? " is-today" : ""}" role="columnheader"><span>${day.label}</span><small>${day.shortDate}</small></div>`))
        .join("");

    const rows = buildHours(workingHours).map((hour) => {
        const slots = visibleDays
            .map((day) => renderSlot(hour, day, workingHours, bookings, calendarEvents, timezone))
            .join("");

        return `<div class="schedule-cell schedule-time" role="rowheader">${hour}</div>${slots}`;
    }).join("");

    return header + rows;
}

function renderSlot(hour, day, workingHours, bookings, calendarEvents, timezone) {
    const scheduleSettings = normalizeScheduleSettings(workingHours.scheduleSettings);
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
    const booking = findBooking(bookings, day.isoDate, hour, timezone);
    const calendarEvent = findCalendarEvent(calendarEvents, day.isoDate, hour);
    const inBuffer = isWithinBookingBuffer(day, hour, bookings, Number(workingHours.bufferMinutes) || 0);
    const activeOnDate = scheduleSettings.activationMode === "permanent"
        || (scheduleSettings.activationMode === "from-date" && (!scheduleSettings.activationDate || day.isoDate >= scheduleSettings.activationDate))
        || (scheduleSettings.activationMode === "single-day" && day.isoDate === scheduleSettings.activationDate);
    const available = activeOnDate && isWorkingDay && isWithinHours && !isBreak && !absence && !booking && !inBuffer;
    const todayClass = day.isToday ? " is-today" : "";
    if (booking) {
        const status = ["pending", "accepted", "done", "no-show"].includes(booking.status) ? booking.status : "pending";
        const clientLabel = escapeHtml(booking.clientDisplayName || booking.guestName || booking.guestContact?.name || strings.bookingLabel);
        const isStart = isBookingStart(booking, day.isoDate, hour, timezone);
        const continues = bookingContinuesPastSlot(booking, day.isoDate, hour, timezone);
        const overlapCount = findBookings(bookings, day.isoDate, hour, timezone).length;
        const overlapBadge = isStart && overlapCount > 1 ? `<span class="overlap-chip schedule-block-overlap" title="${escapeHtml(strings.overlap.replace("{count}", overlapCount))}">${overlapCount}</span>` : "";
        const joinClass = `${isStart ? "" : " is-continuation"}${continues ? " has-continuation" : ""}`;
        return `<div class="schedule-cell schedule-slot schedule-slot-occupied${todayClass}" role="gridcell" data-booking-id="${escapeHtml(booking.id)}" aria-label="${escapeHtml(isStart ? clientLabel : strings.bookingStatuses[status])}" title="${escapeHtml(`${clientLabel} \u00b7 ${strings.bookingStatuses[status]}`)}"><span class="schedule-block schedule-block-${status}${joinClass}">${isStart ? `${overlapBadge}<strong>${clientLabel}</strong><small>${formatSlotRange(booking, timezone)}</small>` : ""}</span></div>`;
    }
    if (calendarEvent) {
        const eventClass = calendarEvent.presentationMode === "solid" ? "schedule-block-calendar-solid" : "schedule-block-calendar-ghost";
        return `<div class="schedule-cell schedule-slot schedule-slot-occupied${todayClass}" role="gridcell" title="${escapeHtml(calendarEvent.title)}"><span class="schedule-block ${eventClass}"><strong>${escapeHtml(calendarEvent.title)}</strong><small>${strings.externalSource}</small></span></div>`;
    }
    if (isBreak && activeOnDate && isWorkingDay && isWithinHours && !absence) {
        return `<div class="schedule-cell schedule-slot schedule-slot-occupied${todayClass}" role="gridcell" data-schedule-date="${day.isoDate}" data-schedule-hour="${hour}" data-available="false"><span class="schedule-block schedule-block-break">${strings.breakSlot}</span></div>`;
    }
    const className = available ? "schedule-slot" : "schedule-slot schedule-slot-unavailable";

    return `<div class="schedule-cell ${className}${todayClass}" role="gridcell" data-schedule-date="${day.isoDate}" data-schedule-hour="${hour}" data-available="${available}" aria-label="${available ? strings.emptySlot : strings.unavailableSlot}"></div>`;
}

function bookingContinuesPastSlot(booking, isoDate, hour, timezone) {
    const end = toDate(booking.end) || toDate(booking.start);
    if (!end) return false;
    return toMinuteKey(getZonedParts(end, timezone)) > toSlotKey(isoDate, addHour(hour));
}

function getVisibleDays(daysToShow, weekOffset, timezone) {
    const todayIso = getZonedDate(new Date(), timezone);
    const monday = getMonday(new Date(`${todayIso}T00:00:00`));
    monday.setDate(monday.getDate() + (weekOffset * 7));

    return Array.from({ length: daysToShow }, (_, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        return {
            date,
            isoDate: toIsoDate(date),
            isToday: toIsoDate(date) === todayIso,
            label: strings.days[index],
            shortDate: formatIsoShortDate(toIsoDate(date))
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

function findBooking(bookings, isoDate, hour, timezone) {
    return findBookings(bookings, isoDate, hour, timezone)[0];
}

function findBookings(bookings, isoDate, hour, timezone) {
    return bookings.filter((booking) => {
        if (booking.status === "rejected") return false;
        const start = toDate(booking.start);
        const end = toDate(booking.end) || start;
        const startParts = start ? getZonedParts(start, timezone) : null;
        const endParts = end ? getZonedParts(end, timezone) : null;
        if (!startParts || !endParts) return false;
        const slotStart = toSlotKey(isoDate, hour);
        const slotEnd = toSlotKey(isoDate, addHour(hour));
        return toMinuteKey(startParts) < slotEnd && toMinuteKey(endParts) > slotStart;
    });
}

function toMinuteKey(parts) {
    return `${parts.date}T${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

function addHour(hour) {
    return `${String(Number(hour.slice(0, 2)) + 1).padStart(2, "0")}:${hour.slice(3)}`;
}

function formatSlotRange(booking, timezone) {
    const start = toDate(booking.start);
    const end = toDate(booking.end) || start;
    if (!start || !end) return "";
    const startParts = getZonedParts(start, timezone);
    const endParts = getZonedParts(end, timezone);
    return `${toMinuteKey(startParts).slice(11)}\u2013${toMinuteKey(endParts).slice(11)}`;
}

function isBookingStart(booking, isoDate, hour, timezone) {
    const start = toDate(booking.start);
    const parts = start ? getZonedParts(start, timezone) : null;
    return parts?.date === isoDate && parts.hour === Number(hour.slice(0, 2));
}

function toSlotKey(isoDate, hour) {
    return `${isoDate}T${hour}`;
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

function attachBookingCreation(container, onCreateBooking, onSelectBooking, onBookingContextMenu, scheduleSettings) {
    let selectedFixedSlots = [];
    const clearFixedSelection = () => {
        selectedFixedSlots = [];
        container.querySelectorAll(".schedule-slot-fixed-selected").forEach((cell) => cell.classList.remove("schedule-slot-fixed-selected"));
    };
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
            if (slot.dataset.available === "true" && scheduleSettings.method === "drag") {
                onCreateBooking?.({ date: slot.dataset.scheduleDate, hour: slot.dataset.scheduleHour });
            }
        });
        if (slot.dataset.available === "true" && scheduleSettings.method === "drag") {
            slot.addEventListener("mousedown", (event) => startDragSelection(event, container, slot, onCreateBooking));
        }
        if (slot.dataset.available === "true" && scheduleSettings.method === "fixed") {
            slot.addEventListener("click", (event) => {
                const slotDetails = { date: slot.dataset.scheduleDate, hour: slot.dataset.scheduleHour };
                if (!scheduleSettings.allowMultipleSlots) {
                    onCreateBooking?.({ ...slotDetails, endHour: addMinutesToHour(slotDetails.hour, scheduleSettings.slotDurationMinutes) });
                    return;
                }
                if (event.detail > 1) {
                    const details = buildFixedBookingDetails(selectedFixedSlots, scheduleSettings.slotDurationMinutes);
                    clearFixedSelection();
                    onCreateBooking?.(details);
                    return;
                }
                const next = toggleFixedSlotSelection(selectedFixedSlots, slotDetails, scheduleSettings.maxSlots);
                if (next.length === selectedFixedSlots.length && !next.some((item) => item.date === slotDetails.date && item.hour === slotDetails.hour)) return;
                selectedFixedSlots = next;
                container.querySelectorAll(".schedule-slot-fixed-selected").forEach((cell) => cell.classList.remove("schedule-slot-fixed-selected"));
                selectedFixedSlots.forEach((item) => findScheduleSlot(container, item.date, item.hour)?.classList.add("schedule-slot-fixed-selected"));
            });
        }
    });
}

function addMinutesToHour(hour, minutes) {
    const [hours, currentMinutes] = hour.split(":").map(Number);
    const total = hours * 60 + currentMinutes + minutes;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
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

function findCalendarEvent(calendarEvents, isoDate, hour) {
    const slotStart = new Date(`${isoDate}T${hour}:00`);
    return calendarEvents.find((event) => {
        const start = toDate(event.start);
        const end = toDate(event.end);
        return start && end && start <= slotStart && end > slotStart;
    });
}

function isWithinBookingBuffer(day, hour, bookings, bufferMinutes) {
    if (!bufferMinutes) return false;
    const slotStart = new Date(day.date);
    const [hoursPart, minutesPart] = hour.split(":").map(Number);
    slotStart.setHours(hoursPart, minutesPart, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
    return bookings.some((booking) => {
        if (booking.status === "rejected") return false;
        const start = toDate(booking.start);
        const end = toDate(booking.end);
        if (!start || !end) return false;
        const expandedStart = new Date(start.getTime() - bufferMinutes * 60000);
        const expandedEnd = new Date(end.getTime() + bufferMinutes * 60000);
        return expandedStart < slotEnd && expandedEnd > slotStart;
    });
}

function getZonedDate(value, timezone) {
    return getZonedParts(value, timezone).date;
}

function getZonedParts(value, timezone) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(value);
    const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    return { date: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour), minute: Number(values.minute) };
}

function formatIsoShortDate(isoDate) {
    return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(new Date(`${isoDate}T12:00:00Z`));
}