import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { escapeHtml } from "../core/utils.js";

const strings = UI_STRINGS.proDashboard.communicationHistory;

export async function initializeClientCommunicationHistory({ client, timezone = "Europe/Paris" }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<section class="glass working-hours-dialog communication-history-dialog" aria-labelledby="communication-history-title"><div class="working-hours-header"><div><span class="eyebrow">${strings.eyebrow}</span><h2 id="communication-history-title">${escapeHtml(client.name)}</h2></div><button class="btn btn-ghost" type="button" data-communication-history-close>${strings.close}</button></div><div class="communication-history-summary"><strong>${client.bookings} ${strings.bookings}</strong><span>${escapeHtml(client.email || strings.noEmail)}</span></div><div data-communication-history-list><p class="working-hours-feedback">${strings.loading}</p></div></section>`;
    document.body.append(modal);
    const list = modal.querySelector("[data-communication-history-list]");
    modal.querySelector("[data-communication-history-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });

    try {
        const groups = await Promise.all(client.bookingItems.map(async (booking) => {
            const snapshot = await getDocs(query(collection(getFirestoreDb(), "bookings", booking.id, "messages"), orderBy("createdAt", "asc")));
            return { booking, messages: snapshot.docs.map((item) => item.data()) };
        }));
        const messages = groups.flatMap(({ booking, messages: bookingMessages }) => bookingMessages.map((message) => ({ booking, message }))).sort((left, right) => toDate(right.message.createdAt) - toDate(left.message.createdAt));
        list.innerHTML = messages.length ? `<div class="communication-timeline">${messages.map(({ booking, message }) => renderMessage(booking, message, timezone)).join("")}</div>` : `<div class="communication-empty"><strong>${strings.emptyTitle}</strong><p>${strings.emptyBody}</p></div>`;
    } catch {
        list.innerHTML = `<p class="working-hours-feedback">${strings.loadError}</p>`;
    }
    return modal;
}

function renderMessage(booking, message, timezone) {
    const sender = message.senderRole === "professional" ? strings.professional : strings.client;
    const tone = message.senderRole === "professional" ? "is-professional" : "is-client";
    return `<article class="communication-entry ${tone}"><div class="communication-entry-marker" aria-hidden="true"></div><div class="communication-entry-content"><div class="communication-entry-meta"><strong>${sender}</strong><span>${formatDate(message.createdAt, timezone)}</span></div><p>${escapeHtml(message.body || "")}</p><small>${strings.booking} · ${formatDate(booking.start, timezone)}</small></div></article>`;
}

function toDate(value) { if (!value) return new Date(0); if (typeof value.toDate === "function") return value.toDate(); const date = new Date(value); return Number.isNaN(date.getTime()) ? new Date(0) : date; }
function formatDate(value, timezone) { return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: timezone }).format(toDate(value)); }
