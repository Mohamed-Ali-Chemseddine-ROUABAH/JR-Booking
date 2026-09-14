import { UI_STRINGS } from "../core/strings-fr.js";
import { escapeHtml } from "../core/utils.js";

const strings = UI_STRINGS.clientDashboard.bookings;

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

        if (event.target.matches("[data-accept]")) {
            onAccept?.(booking);
        }
        if (event.target.matches("[data-cancel]")) {
            onCancel?.(booking);
        }
        if (event.target.matches("[data-request-change]")) {
            onRequestChange?.(booking);
        }
        if (event.target.matches("[data-unlink-claim]")) {
            const contact = booking.contacts?.find((item) => item.linkedUid === userId);
            if (contact) onUnlinkClaim?.(booking, contact);
        }
        if (event.target.matches("[data-share-history]")) {
            onRequestHistoryShare?.(booking, event.target.dataset.shareHistory);
        }
        if (event.target.matches("[data-message-booking]")) {
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
        const bookingActions = isProMade
            ? `<div class="sidebar-booking-actions"><button class="btn btn-solid" type="button" data-accept>${strings.acceptBooking}</button><button class="btn btn-ghost" type="button" data-request-change>${strings.requestChange}</button></div>`
            : isOwnPending
                ? `<div class="sidebar-booking-actions"><button class="btn btn-ghost" type="button" data-cancel>${strings.cancelBooking}</button></div>`
                : "";
            const messageAction = `<div class="sidebar-booking-actions"><button class="btn btn-ghost" type="button" data-message-booking>${UI_STRINGS.shared.bookingMessages.title}</button></div>`;
        const linkedContact = booking.contacts?.find((item) => item.linkedUid === userId);
        const unlinkAction = isOwnBooking && booking.claimState === "claimed" && linkedContact
            ? `<div class="sidebar-booking-actions"><button class="btn btn-ghost" type="button" data-unlink-claim>${strings.unlinkClaim}</button></div>`
            : "";
        const shareTargets = isOwnBooking ? (booking.contacts || []).filter((item) => item.linkedUid && item.linkedUid !== userId) : [];
        const shareActions = shareTargets.length
            ? `<div class="sidebar-booking-actions">${shareTargets.map((contact) => `<button class="btn btn-ghost" type="button" data-share-history="${escapeHtml(contact.linkedUid)}" title="${escapeHtml(strings.shareHistory(contact.name || contact.email))}">${escapeHtml(strings.shareHistory(contact.name || contact.email))}</button>`).join("")}</div>`
            : "";
        const movementQuote = booking.movementQuote
            ? `<small>${strings.movementDistance}: ${booking.movementQuote.distanceKm} km · ${strings.movementSurcharge}: ${booking.paymentContext?.surcharge ?? booking.movementQuote.surcharge} €</small>`
            : "";
        return `<article class="glass-ghost sidebar-booking-card" data-booking-card="${booking.id}"><strong>${name}</strong><span>${strings.bookingDate}: ${date}</span><span>${strings.bookingTime}: ${time}</span><small>${strings.statuses[booking.status] || booking.status}</small>${movementQuote}${notice}${messageAction}${bookingActions}${unlinkAction}${shareActions}</article>`;
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
