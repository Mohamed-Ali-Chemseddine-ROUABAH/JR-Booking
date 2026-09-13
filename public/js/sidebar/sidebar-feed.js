import { UI_STRINGS } from "../core/strings-fr.js";
import { applyBatchStatus } from "./batch-actions.js";

const strings = UI_STRINGS.proDashboard.sidebar;
const bookingStatuses = UI_STRINGS.proDashboard.schedule.bookingStatuses;

export function initializeSidebarFeed(container, { onToggleSidebar, onStatusChange, onBatchStatus, onEditBooking, onMessages, onPrepNotes, onFilterChange, initialFilter = "pending", bookings = [] }) {
    container.innerHTML = `
        <div class="sidebar-head">
            <h1>${strings.title}</h1>
            <div class="sidebar-controls">
                <button class="icon-button" type="button" aria-label="${strings.collapse}" title="${strings.collapse}" data-sidebar-toggle>‹</button>
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
        const name = escapeHtml(booking.clientDisplayName || booking.guestName || booking.guestContact?.name || strings.bookingFallbackName);
        const date = start ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(start) : "";
        const time = start ? start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
        const editAction = onEditBooking ? `<button class="btn btn-ghost" type="button" data-edit-booking>${strings.editBooking}</button>` : "";
        const messageAction = onMessages ? `<button class="btn btn-ghost" type="button" data-message-booking>${UI_STRINGS.shared.bookingMessages.title}</button>` : "";
        const prepNotesAction = onPrepNotes ? `<button class="btn btn-ghost" type="button" data-prep-notes>${strings.prepNotes}</button>` : "";
        const statusActions = Boolean(onStatusChange);
        const actions = booking.status === "pending"
            ? `<div class="sidebar-booking-actions">${editAction}${messageAction}${prepNotesAction}${statusActions ? `<button class="btn btn-solid" type="button" data-status-action="accepted">${strings.acceptBooking}</button><button class="btn btn-ghost" type="button" data-status-action="rejected">${strings.rejectBooking}</button>` : ""}</div>`
            : booking.status === "accepted"
                ? `<div class="sidebar-booking-actions">${editAction}${messageAction}${prepNotesAction}${statusActions ? `<button class="btn btn-solid" type="button" data-status-action="done">${strings.completeBooking}</button><button class="btn btn-ghost" type="button" data-status-action="no-show">${strings.noShowBooking}</button>` : ""}</div>`
                : `<div class="sidebar-booking-actions">${editAction}${messageAction}${prepNotesAction}</div>`;
        const select = activeFilter === "pending" && onBatchStatus ? `<label class="booking-select"><input type="checkbox" data-select-booking="${booking.id}"><span class="visually-hidden">${strings.selectBooking}</span></label>` : "";
        return `<article class="glass-ghost sidebar-booking-card" data-booking-card="${booking.id}">${select}<strong>${name}</strong><span>${strings.bookingDate}: ${date}</span><span>${strings.bookingTime}: ${time}</span><small>${bookingStatuses[booking.status] || strings.bookingFallbackName}</small>${actions}</article>`;
    }).join("")}`;

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