import { UI_STRINGS } from "../core/strings-fr.js";
import { collection, getDocs, limit, orderBy, query, updateDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { initializeQuietWidgetToggle } from "./today-widget-toggle.mjs?v=search-retract-20260914";

const strings = UI_STRINGS.proDashboard.today;

export function initializeTodayView(container, bookings = [], timezone = "Europe/Paris") {
    const today = new Date();
    const todaysBookings = bookings.filter((booking) => {
        const start = toDate(booking.start);
        return start && sameDay(start, today, timezone) && booking.status !== "rejected";
    }).sort((left, right) => toDate(left.start) - toDate(right.start));
    const nextBooking = todaysBookings.find((booking) => toDate(booking.end) > new Date()) || todaysBookings[0];
    const isQuiet = todaysBookings.length === 0;
    const quietAttributes = isQuiet ? ` role="button" aria-expanded="false" aria-controls="today-widget-details" tabindex="0"` : "";
    container.innerHTML = `<section class="today-widget glass-ghost${isQuiet ? " is-quiet" : ""}" aria-label="${strings.title}"${quietAttributes}><div class="today-widget-header"><div><span class="eyebrow">${strings.eyebrow}</span><h2>${strings.title}</h2></div><span class="today-count">${todaysBookings.length} ${todaysBookings.length === 1 ? strings.booking : strings.bookings}</span></div><div class="today-widget-details"${isQuiet ? ` id="today-widget-details" aria-hidden="true"` : ""}>${nextBooking ? `<article class="today-next"><strong>${escapeHtml(getBookingName(nextBooking))}</strong><span>${formatTime(nextBooking.start, timezone)} · ${formatTime(nextBooking.end, timezone)}</span><small>${strings.next}</small></article>` : `<p class="today-empty">${strings.empty}</p>`}<div class="today-list">${todaysBookings.map((booking) => `<button class="today-item" type="button" data-today-booking="${escapeHtml(booking.id)}"><span>${formatTime(booking.start, timezone)}</span><strong>${escapeHtml(getBookingName(booking))}</strong><small>${strings.statuses[booking.status] || booking.status}</small></button>`).join("")}</div></div></section>`;
    if (isQuiet) {
        initializeQuietWidgetToggle(container.querySelector(".today-widget"));
    }
    container.querySelectorAll("[data-today-booking]").forEach((item) => item.addEventListener("click", () => container.dispatchEvent(new CustomEvent("today-booking-selected", { detail: item.dataset.todayBooking }))));
}

export async function initializeNotificationCenter(container, { bookings = [], timezone = "Europe/Paris", userId, onSelectBooking } = {}) {
    const pending = bookings.filter((booking) => booking.status === "pending");
    const upcoming = bookings.filter((booking) => booking.status === "accepted" && toDate(booking.start) >= new Date()).sort((left, right) => toDate(left.start) - toDate(right.start)).slice(0, 5);
    let notifications = [
        ...pending.map((booking) => ({ booking, label: strings.pendingNotification, action: strings.review })),
        ...upcoming.map((booking) => ({ booking, label: strings.upcomingNotification, action: strings.open }))
    ];
    const modal = document.createElement("div");
    modal.className = "booking-creation-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<section class="glass booking-creation-dialog" aria-labelledby="notifications-title"><div class="working-hours-header"><h2 id="notifications-title">${strings.notifications}</h2><button class="btn btn-ghost" type="button" data-notifications-close>${strings.close}</button></div><div data-notification-content>${renderNotifications(notifications, timezone)}</div></section>`;
    document.body.append(modal);
    modal.querySelector("[data-notifications-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
    modal.querySelectorAll("[data-notification-booking]").forEach((item) => item.addEventListener("click", async () => { if (item.dataset.notificationId && userId) await updateDoc(doc(getFirestoreDb(), "notifications", userId, "items", item.dataset.notificationId), { readAt: serverTimestamp() }); onSelectBooking?.(item.dataset.notificationBooking); modal.remove(); }));
    if (userId) {
        getDocs(query(collection(getFirestoreDb(), "notifications", userId, "items"), orderBy("createdAt", "desc"), limit(30))).then((snapshot) => {
            const persisted = snapshot.docs.map((item) => ({ id: item.id, notification: item.data() }));
            const content = modal.querySelector("[data-notification-content]");
            if (!content || !persisted.length) return;
            content.innerHTML = renderNotifications(persisted, timezone);
            content.querySelectorAll("[data-notification-booking]").forEach((item) => item.addEventListener("click", async () => { await updateDoc(doc(getFirestoreDb(), "notifications", userId, "items", item.dataset.notificationId), { readAt: serverTimestamp() }); onSelectBooking?.(item.dataset.notificationBooking); modal.remove(); }));
        }).catch(() => {});
    }
    return modal;
}

function renderNotifications(notifications, timezone = "Europe/Paris") { return notifications.length ? `<div class="notification-list">${notifications.map((item) => item.notification ? renderPersistedNotification(item, timezone) : renderBookingNotification(item, timezone)).join("")}</div>` : `<p class="today-empty">${strings.noNotifications}</p>`; }
function renderBookingNotification({ booking, label, action }, timezone) { return `<button class="notification-item" type="button" data-notification-booking="${escapeHtml(booking.id)}"><strong>${label}</strong><span>${escapeHtml(getBookingName(booking))} · ${formatDateTime(booking.start, timezone)}</span><small>${action}</small></button>`; }
function renderPersistedNotification({ id, notification }, timezone) { return `<button class="notification-item${notification.readAt ? " is-read" : ""}" type="button" data-notification-id="${escapeHtml(id)}" data-notification-booking="${escapeHtml(notification.bookingId || "")}"><strong>${escapeHtml(notification.title || strings.notifications)}</strong><span>${escapeHtml(notification.body || "")}</span><small>${notification.readAt ? strings.read : strings.unread}${notification.createdAt ? ` · ${formatDateTime(notification.createdAt, timezone)}` : ""}</small></button>`; }

function getBookingName(booking) { return booking.clientDisplayName || booking.guestName || booking.guestContact?.name || strings.bookingFallback; }
function toDate(value) { if (!value) return null; if (typeof value.toDate === "function") return value.toDate(); const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
function sameDay(left, right, timezone) { return getZonedDate(left, timezone) === getZonedDate(right, timezone); }
function formatTime(value, timezone) { const date = toDate(value); return date ? date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: timezone }) : ""; }
function formatDateTime(value, timezone) { const date = toDate(value); return date ? date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: timezone }) : ""; }
function getZonedDate(value, timezone) { const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value); const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])); return `${values.year}-${values.month}-${values.day}`; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character])); }
