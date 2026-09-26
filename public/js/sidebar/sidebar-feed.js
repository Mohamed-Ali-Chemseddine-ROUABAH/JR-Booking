import { UI_STRINGS } from "../core/strings-fr.js?v=mockup-parity-b-20260924";
import { applyBatchStatus } from "./batch-actions.js";

const strings = UI_STRINGS.proDashboard.sidebar;
const bookingStatuses = UI_STRINGS.proDashboard.schedule.bookingStatuses;

const ICONS = {
    edit: `<path d="m4 16-1 4 4-1L18 8l-3-3L4 16z"/>`,
    messages: `<path d="M4 5h16v11H8l-4 3z"/><path d="M8 9h8"/>`,
    note: `<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>`,
    accept: `<polyline points="20 6 9 17 4 12"/>`,
    reject: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
    noShow: `<circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/>`
};

function bookingActionButton(label, dataAttribute, iconPath) {
    return `<button class="booking-action-button" type="button" ${dataAttribute} title="${label}" aria-label="${label}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPath}</svg></button>`;
}

export function initializeSidebarFeed(container, { onToggleSidebar, onStatusChange, onBatchStatus, onEditBooking, onMessages, onPrepNotes, onFilterChange, initialFilter = "pending", bookings = [] }) {
    container.innerHTML = `
        <div class="sidebar-head">
            <h1>${strings.title}</h1>
            <div class="sidebar-controls">
                <button class="icon-button" type="button" aria-label="${strings.collapse}" title="${strings.collapse}" data-sidebar-toggle><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg></button>
            </div>
        </div>
        <div class="feed-filters" role="group" aria-label="${strings.title}">
            <button class="chip-button is-active" type="button" data-filter="pending">${strings.pending}</button>
            <button class="chip-button" type="button" data-filter="accepted">${strings.accepted}</button>
            <button class="chip-button" type="button" data-filter="rejected">${strings.rejected}</button>
        </div>
        <section class="sidebar-bookings" data-sidebar-bookings aria-live="polite">
        </section>
    `;

    container.querySelector("[data-sidebar-toggle]").addEventListener("click", onToggleSidebar);
    const bookingsRoot = container.querySelector("[data-sidebar-bookings]");
    let activeFilter = initialFilter;
    container.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("is-active", button.dataset.filter === activeFilter));
    renderBookings(bookingsRoot, bookings, onStatusChange, onBatchStatus, onEditBooking, onMessages, onPrepNotes, activeFilter);
    container.querySelectorAll("[data-filter]").forEach((button) => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;
            onFilterChange?.(activeFilter);
            container.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
            renderBookings(bookingsRoot, bookings, onStatusChange, onBatchStatus, onEditBooking, onMessages, onPrepNotes, activeFilter);
        });
    });

    return {
        getFilter() {
            return activeFilter;
        },
        selectBooking(bookingId) {
            container.querySelectorAll("[data-booking-card]").forEach((card) => {
                card.classList.toggle("is-selected", card.dataset.bookingCard === bookingId);
            });
        }
    };
}

function renderBookings(container, bookings, onStatusChange, onBatchStatus, onEditBooking, onMessages, onPrepNotes, activeFilter) {
    const visibleBookings = bookings.filter((booking) => matchesFilter(booking, activeFilter));
    if (!visibleBookings.length) {
        container.innerHTML = `<section class="glass-ghost empty-feed"><h2>${strings.emptyTitle}</h2><p>${strings.emptyBody}</p><button class="btn btn-ghost" type="button" disabled>${strings.batchAction}</button></section>`;
        return;
    }

    container.innerHTML = `${activeFilter === "pending" && onBatchStatus ? `<div class="batch-toolbar"><label><input type="checkbox" data-select-all> ${strings.selectAll}</label><span data-batch-count>0</span><button class="btn btn-solid" type="button" data-batch-action="accepted" disabled>${strings.acceptSelected}</button><button class="btn btn-ghost" type="button" data-batch-action="rejected" disabled>${strings.rejectSelected}</button></div>` : ""}${visibleBookings.map((booking) => {
        const start = toDate(booking.start);
        const name = escapeHtml(booking.clientDisplayName || booking.guestName || booking.guestContact?.name || booking.clientEmail || strings.bookingFallbackName);
        const date = start ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(start) : "";
        const time = start ? start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
        const editAction = onEditBooking ? bookingActionButton(strings.editBooking, "data-edit-booking", ICONS.edit) : "";
        const messageAction = onMessages ? bookingActionButton(UI_STRINGS.shared.bookingMessages.title, "data-message-booking", ICONS.messages) : "";
        const prepNotesAction = onPrepNotes ? bookingActionButton(strings.prepNotes, "data-prep-notes", ICONS.note) : "";
        const statusActions = Boolean(onStatusChange);
        const actions = booking.status === "pending"
            ? `<div class="sidebar-booking-actions">${editAction}${messageAction}${prepNotesAction}${statusActions ? `${bookingActionButton(strings.acceptBooking, `data-status-action="accepted"`, ICONS.accept)}${bookingActionButton(strings.rejectBooking, `data-status-action="rejected"`, ICONS.reject)}` : ""}</div>`
            : booking.status === "accepted"
                ? `<div class="sidebar-booking-actions">${editAction}${messageAction}${prepNotesAction}${statusActions ? `${bookingActionButton(strings.completeBooking, `data-status-action="done"`, ICONS.accept)}${bookingActionButton(strings.noShowBooking, `data-status-action="no-show"`, ICONS.noShow)}` : ""}</div>`
                : `<div class="sidebar-booking-actions">${editAction}${messageAction}${prepNotesAction}</div>`;
        const select = activeFilter === "pending" && onBatchStatus ? `<label class="booking-select"><input type="checkbox" data-select-booking="${booking.id}"><span class="visually-hidden">${strings.selectBooking}</span></label>` : "";
        const statusKey = ["pending", "accepted", "done", "no-show", "rejected"].includes(booking.status) ? booking.status : "pending";
        return `<article class="glass-ghost sidebar-booking-card status-${statusKey}" data-booking-card="${booking.id}">${select}<div class="booking-card-top"><div><strong class="booking-card-name">${name}</strong><span class="booking-card-time">${date} · ${time}</span></div><span class="booking-status-tag status-${statusKey}">${bookingStatuses[booking.status] || strings.bookingFallbackName}</span></div>${actions}${renderCardDetails(booking)}</article>`;
    }).join("")}`;

    const overlaps = findOverlaps(visibleBookings);
    if (overlaps.length) {
        container.insertAdjacentHTML("afterbegin", `<div class="overlap-note">${overlaps.map((_, index) => `<div class="overlap-chip">${index + 1}</div>`).join("")}<p>${escapeHtml(strings.overlapNote.replace("{times}", overlaps.join(", ")))}</p></div>`);
    }

    container.querySelectorAll("[data-booking-card]").forEach((card) => {
        if (!card.querySelector(".booking-card-expand")) return;
        card.addEventListener("click", (event) => {
            if (event.target.closest("button, label, input, a")) return;
            card.classList.toggle("is-open");
        });
    });

    const updateBatch = () => {
        const selected = [...container.querySelectorAll("[data-select-booking]:checked")];
        container.querySelector("[data-batch-count]")?.replaceChildren(document.createTextNode(`${selected.length} ${strings.selected}`));
        container.querySelectorAll("[data-batch-action]").forEach((button) => { button.disabled = !selected.length; });
        const selectAll = container.querySelector("[data-select-all]");
        if (selectAll) selectAll.checked = selected.length === visibleBookings.length && visibleBookings.length > 0;
    };
    container.querySelector("[data-select-all]")?.addEventListener("change", (event) => {
        container.querySelectorAll("[data-select-booking]").forEach((input) => { input.checked = event.target.checked; });
        updateBatch();
    });
    container.querySelectorAll("[data-select-booking]").forEach((input) => input.addEventListener("change", updateBatch));
    container.querySelectorAll("[data-batch-action]").forEach((button) => button.addEventListener("click", async () => {
        const selected = visibleBookings.filter((booking) => container.querySelector(`[data-select-booking="${booking.id}"]`)?.checked);
        await applyBatchStatus(selected, button.dataset.batchAction, onBatchStatus || (async (items, status) => Promise.all(items.map((booking) => onStatusChange(booking.id, status, booking.status, { silent: true })))));
    }));

    container.querySelectorAll("[data-status-action]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const booking = bookings.find((item) => item.id === button.closest("[data-booking-card]").dataset.bookingCard);
            onStatusChange?.(booking.id, button.dataset.statusAction, booking.status);
        });
    });
    container.querySelectorAll("[data-edit-booking]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const booking = bookings.find((item) => item.id === button.closest("[data-booking-card]").dataset.bookingCard);
            onEditBooking?.(booking);
        });
    });
    container.querySelectorAll("[data-message-booking]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const booking = bookings.find((item) => item.id === button.closest("[data-booking-card]").dataset.bookingCard);
            onMessages?.(booking);
        });
    });
    container.querySelectorAll("[data-prep-notes]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const booking = bookings.find((item) => item.id === button.closest("[data-booking-card]").dataset.bookingCard);
            onPrepNotes?.(booking);
        });
    });
}

function renderCardDetails(booking) {
    const rows = [
        [strings.detailEmail, booking.guestContact?.email || booking.clientEmail],
        [strings.detailPhone, booking.guestContact?.phone],
        [strings.detailService, booking.service?.name],
        [strings.detailPrice, (booking.customPrice ?? booking.service?.price) ? `${booking.customPrice ?? booking.service?.price} \u20ac` : ""],
        [strings.detailSeries, booking.seriesId ? strings.detailSeriesValue : ""]
    ].filter(([, value]) => value);
    if (!rows.length) return "";
    return `<div class="booking-card-expand">${rows.map(([label, value]) => `<div class="booking-card-row">${escapeHtml(label)}<b>${escapeHtml(value)}</b></div>`).join("")}</div>`;
}

/** Start times shared by more than one visible request, for the mockup's overlap banner. */
function findOverlaps(bookings) {
    const byStart = new Map();
    bookings.forEach((booking) => {
        const start = toDate(booking.start);
        if (!start) return;
        const key = start.toISOString();
        byStart.set(key, (byStart.get(key) || 0) + 1);
    });
    return [...byStart.entries()]
        .filter(([, count]) => count > 1)
        .map(([key]) => new Date(key).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
}

function toDate(value) {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[character]);
}

function matchesFilter(booking, filter) {
    if (filter === "rejected") return booking.status === "rejected";
    if (filter === "accepted") return ["accepted", "done", "no-show"].includes(booking.status);
    return booking.status === "pending";
}