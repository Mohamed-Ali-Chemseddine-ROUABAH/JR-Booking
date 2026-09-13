import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.sidebar;
const bookingStatuses = UI_STRINGS.proDashboard.schedule.bookingStatuses;

export function initializeSidebarFeed(container, { onToggleSidebar, onStatusChange, onEditBooking, onMessages, onFilterChange, initialFilter = "pending", bookings = [] }) {
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
    renderBookings(bookingsRoot, bookings, onStatusChange, onEditBooking, onMessages, activeFilter);
    container.querySelectorAll("[data-filter]").forEach((button) => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;
            onFilterChange?.(activeFilter);
            container.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
            renderBookings(bookingsRoot, bookings, onStatusChange, onEditBooking, onMessages, activeFilter);
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

function renderBookings(container, bookings, onStatusChange, onEditBooking, onMessages, activeFilter) {
    const visibleBookings = bookings.filter((booking) => matchesFilter(booking, activeFilter));
    if (!visibleBookings.length) {
        container.innerHTML = `<section class="glass-ghost empty-feed"><h2>${strings.emptyTitle}</h2><p>${strings.emptyBody}</p><button class="btn btn-ghost" type="button" disabled>${strings.batchAction}</button></section>`;
        return;
    }

    container.innerHTML = visibleBookings.map((booking) => {
        const start = toDate(booking.start);
        const name = escapeHtml(booking.clientDisplayName || booking.guestName || booking.guestContact?.name || strings.bookingFallbackName);
        const date = start ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(start) : "";
        const time = start ? start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
        const editAction = `<button class="btn btn-ghost" type="button" data-edit-booking>${strings.editBooking}</button>`;
        const messageAction = `<button class="btn btn-ghost" type="button" data-message-booking>${UI_STRINGS.shared.bookingMessages.title}</button>`;
        const actions = booking.status === "pending"
            ? `<div class="sidebar-booking-actions">${editAction}${messageAction}<button class="btn btn-solid" type="button" data-status-action="accepted">${strings.acceptBooking}</button><button class="btn btn-ghost" type="button" data-status-action="rejected">${strings.rejectBooking}</button></div>`
            : booking.status === "accepted"
                ? `<div class="sidebar-booking-actions">${editAction}${messageAction}<button class="btn btn-solid" type="button" data-status-action="done">${strings.completeBooking}</button><button class="btn btn-ghost" type="button" data-status-action="no-show">${strings.noShowBooking}</button></div>`
                : `<div class="sidebar-booking-actions">${editAction}${messageAction}</div>`;
        return `<article class="glass-ghost sidebar-booking-card" data-booking-card="${booking.id}"><strong>${name}</strong><span>${strings.bookingDate}: ${date}</span><span>${strings.bookingTime}: ${time}</span><small>${bookingStatuses[booking.status] || strings.bookingFallbackName}</small>${actions}</article>`;
    }).join("");

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