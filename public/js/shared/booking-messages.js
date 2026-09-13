import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { getFirebaseFunctions, getFirestoreDb } from "../core/firebase-init.js";
import { escapeHtml } from "../core/utils.js";
import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.shared.bookingMessages;

export async function initializeBookingMessages({ booking, userId, userRole }) {
    const modal = document.createElement("div");
    modal.className = "booking-creation-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <section class="glass booking-creation-dialog" aria-labelledby="booking-messages-title">
            <div class="working-hours-header"><h2 id="booking-messages-title">${strings.title}</h2><button class="btn btn-ghost" type="button" data-messages-close>${strings.close}</button></div>
            <div class="booking-message-list" data-message-list aria-live="polite"><p>${strings.loading}</p></div>
            <form class="working-hours-fields" data-message-form>
                <label class="working-hours-field"><span>${strings.bodyLabel}</span><textarea name="body" rows="4" maxlength="4000" required></textarea></label>
                <label class="booking-contact-notify"><input type="checkbox" name="notifyEmail" checked> ${strings.notifyEmail}</label>
                <div class="working-hours-actions"><span class="working-hours-feedback" data-message-feedback role="status" aria-live="polite"></span><button class="btn btn-solid" type="submit">${strings.send}</button></div>
            </form>
        </section>`;
    document.body.append(modal);

    const list = modal.querySelector("[data-message-list]");
    const feedback = modal.querySelector("[data-message-feedback]");
    modal.querySelector("[data-messages-close]").addEventListener("click", () => modal.remove());
    if (userRole === "shared-client") modal.querySelector("[data-message-form]").remove();

    try {
        const snapshot = await getDocs(query(collection(getFirestoreDb(), "bookings", booking.id, "messages"), orderBy("createdAt", "asc")));
        list.innerHTML = snapshot.empty
            ? `<p>${strings.empty}</p>`
            : snapshot.docs.map((item) => renderMessage(item.id, item.data(), item.data().senderUid === userId)).join("");
    } catch {
        list.innerHTML = `<p>${strings.loadError}</p>`;
    }

    modal.querySelector("[data-message-form]")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const body = form.body.value.trim();
        if (!body) return;
        form.querySelector("button[type=submit]").disabled = true;
        try {
            const result = await httpsCallable(getFirebaseFunctions(), "sendBookingMessage")({ bookingId: booking.id, body, notifyEmail: form.notifyEmail.checked });
            feedback.textContent = result.data.notificationStatus === "queued" ? strings.queued : strings.saved;
            form.reset();
            form.notifyEmail.checked = true;
            await initializeBookingMessages({ booking, userId, userRole });
            modal.remove();
        } catch {
            feedback.textContent = strings.error;
            form.querySelector("button[type=submit]").disabled = false;
        }
    });

    return modal;
}

function renderMessage(messageId, message, isOwn) {
    const status = message.notificationStatus === "queued" ? strings.emailQueued : message.notificationStatus === "failed" ? strings.emailFailed : "";
    return `<article class="glass-ghost booking-message"><strong>${isOwn ? strings.you : strings.other}</strong><p>${escapeHtml(message.body || "")}</p><small>${formatDate(message.createdAt)}${status ? ` · ${status}` : ""}</small></article>`;
}

function formatDate(value) {
    const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}
