import { UI_STRINGS } from "../core/strings-fr.js";
import { escapeHtml } from "../core/utils.js";

const strings = UI_STRINGS.clientDashboard.bookings;

const ICONS = {
    message: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"/></svg>`,
    accept: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4 10-10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,
    reschedule: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16-1 4 4-1L18 8l-3-3L4 16z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"/></svg>`,
    cancel: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg>`,
    unlink: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 15 4 20m11-11 5-5M10 7l2-2a4 4 0 0 1 5 5l-2 2M14 17l-2 2a4 4 0 0 1-5-5l2-2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg>`,
    share: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6a2.5 2.5 0 1 0 0-.1M8 12a2.5 2.5 0 1 0 0-.1M16 18a2.5 2.5 0 1 0 0-.1m-5.8-7.3 4.6-2.4m0 7.4-4.6-2.4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg>`
};

export function initializeClientBookings(container, { userId, timezone = "Europe/Paris", bookings = [], onAccept, onCancel, onRequestChange, onUnlinkClaim, onRequestHistoryShare, onMessages, initialFilter = "pending", onFilterChange } = {}) {
    container.innerHTML = `
        <div class="sidebar-head">
            <h1>${strings.title}</h1>
        </div>
        <div class="feed-filters" role="group" aria-label="${strings.title}">
            <button class="chip-button" type="button" data-filter="pending">${strings.pending}</button>
            <button class="chip-button" type="button" data-filter="accepted">${strings.accepted}</button>
            <button class="chip-button" type="button" data-filter="rejected">${strings.rejected}</button>
        </div>
        <section class="sidebar-bookings" data-client-bookings aria-live="polite"></section>
    `;

    const bookingsRoot = container.querySelector("[data-client-bookings]");
    let activeFilter = initialFilter;

    const applyFilter = (filter) => {
        activeFilter = filter;
        container.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item.dataset.filter === filter));
        renderBookings(bookingsRoot, userId, timezone, bookings, activeFilter);
    };

    container.querySelectorAll("[data-filter]").forEach((button) => {
        button.addEventListener("click", () => {
            onFilterChange?.(button.dataset.filter);
            applyFilter(button.dataset.filter);
        });
    });

    bookingsRoot.addEventListener("click", (event) => {
        const card = event.target.closest("[data-booking-card]");
        if (!card) return;
        const booking = bookings.find((item) => item.id === card.dataset.bookingCard);
        if (!booking) return;
        const action = event.target.closest("[data-accept], [data-cancel], [data-request-change], [data-unlink-claim], [data-share-history], [data-message-booking]");
        if (!action) return;

        if (action.matches("[data-accept]")) {
            onAccept?.(booking);
        }
        if (action.matches("[data-cancel]")) {
            onCancel?.(booking);
        }
        if (action.matches("[data-request-change]")) {
            onRequestChange?.(booking);
        }
        if (action.matches("[data-unlink-claim]")) {
            const contact = booking.contacts?.find((item) => item.linkedUid === userId);
            if (contact) onUnlinkClaim?.(booking, contact);
        }
        if (action.matches("[data-share-history]")) {
            onRequestHistoryShare?.(booking, action.dataset.shareHistory);
        }
        if (action.matches("[data-message-booking]")) {
            onMessages?.(booking, booking.clientId === userId ? "client" : "shared-client");
        }
    });

    applyFilter(activeFilter);
}

function renderBookings(container, userId, timezone, bookings, activeFilter) {
    const visibleBookings = bookings.filter((booking) => matchesFilter(booking, activeFilter));
    if (!visibleBookings.length) {
        container.innerHTML = `<section class="glass-ghost empty-feed"><h2>${strings.emptyTitle}</h2><p>${strings.emptyBody}</p></section>`;
        return;
    }

    container.innerHTML = visibleBookings.map((booking) => {
        const start = toDate(booking.start);
        const name = escapeHtml(booking.proDisplayName || strings.bookingFallbackName);
        const date = start ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", timeZone: timezone }).format(start) : "";
        const time = start ? start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: timezone }) : "";
        const isOwnBooking = booking.clientId === userId;
        const isProMade = isOwnBooking && booking.status === "pending" && booking.createdBy && booking.createdBy !== userId;
        const isOwnPending = isOwnBooking && booking.status === "pending" && (!booking.createdBy || booking.createdBy === userId);
        const notice = isProMade
            ? `<p class="client-booking-notice">${strings.awaitingConfirmation}</p>`
            : !isOwnBooking
                ? `<p class="client-booking-notice">${strings.sharedHistoryNotice}</p>`
                : "";
        const bookingActions = [
            `<button class="booking-action-button" type="button" data-message-booking aria-label="${UI_STRINGS.shared.bookingMessages.title}" title="${UI_STRINGS.shared.bookingMessages.title}">${ICONS.message}</button>`,
            isProMade ? `<button class="booking-action-button" type="button" data-accept aria-label="${strings.acceptBooking}" title="${strings.acceptBooking}">${ICONS.accept}</button>` : "",
            isProMade ? `<button class="booking-action-button" type="button" data-request-change aria-label="${strings.requestChange}" title="${strings.requestChange}">${ICONS.reschedule}</button>` : "",
            isOwnPending ? `<button class="booking-action-button" type="button" data-cancel aria-label="${strings.cancelBooking}" title="${strings.cancelBooking}">${ICONS.cancel}</button>` : "",
            isOwnBooking && booking.claimState === "claimed" && booking.contacts?.some((item) => item.linkedUid === userId)
                ? `<button class="booking-action-button" type="button" data-unlink-claim aria-label="${strings.unlinkClaim}" title="${strings.unlinkClaim}">${ICONS.unlink}</button>` : "",
            ...(isOwnBooking ? (booking.contacts || []).filter((item) => item.linkedUid && item.linkedUid !== userId) : [])
                .map((contact) => `<button class="booking-action-button" type="button" data-share-history="${escapeHtml(contact.linkedUid)}" aria-label="${escapeHtml(strings.shareHistory(contact.name || contact.email))}" title="${escapeHtml(strings.shareHistory(contact.name || contact.email))}">${ICONS.share}</button>`)
        ].filter(Boolean).join("");
        const movementQuote = booking.movementQuote
            ? `<small>${strings.movementDistance}: ${booking.movementQuote.distanceKm} km · ${strings.movementSurcharge}: ${booking.paymentContext?.surcharge ?? booking.movementQuote.surcharge} €</small>`
            : "";
        const statusKey = ["pending", "accepted", "done", "no-show", "rejected"].includes(booking.status) ? booking.status : "pending";
        return `<article class="glass-ghost sidebar-booking-card status-${statusKey}" data-booking-card="${booking.id}"><div class="booking-card-top"><div><strong class="booking-card-name">${name}</strong><span class="booking-card-time">${date} · ${time}</span></div><span class="booking-status-tag status-${statusKey}">${strings.statuses[booking.status] || booking.status}</span></div>${movementQuote}${notice}<div class="sidebar-booking-actions">${bookingActions}</div></article>`;
    }).join("");
}

function matchesFilter(booking, filter) {
    if (filter === "rejected") return booking.status === "rejected";
    if (filter === "accepted") return ["accepted", "done", "no-show"].includes(booking.status);
    return booking.status === "pending";
}

function toDate(value) {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
