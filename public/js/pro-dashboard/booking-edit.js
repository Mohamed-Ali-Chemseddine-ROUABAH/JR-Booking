import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { getFirebaseFunctions } from "../core/firebase-init.js";
import { initializeBookingContactEditor } from "./booking-contacts.js";

const strings = UI_STRINGS.proDashboard.sidebar;

export function initializeBookingEdit({ booking, onSaved }) {
    const modal = document.createElement("div");
    modal.className = "booking-creation-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <form class="glass booking-creation-dialog" aria-labelledby="booking-edit-title">
            <div class="working-hours-header"><h2 id="booking-edit-title">${strings.editTitle}</h2><button class="btn btn-ghost" type="button" data-edit-close>Fermer</button></div>
            <div data-booking-contacts></div>
            <div class="working-hours-fields">
                <label class="working-hours-field"><span>Début</span><input name="start" type="datetime-local" required></label>
                <label class="working-hours-field"><span>Fin</span><input name="end" type="datetime-local" required></label>
                ${booking.seriesId ? `<label class="working-hours-field"><span>Appliquer à</span><select name="seriesScope"><option value="this">Cette occurrence</option><option value="this-and-following">Cette occurrence et les suivantes</option><option value="all-in-series">Toute la série</option></select></label>` : ""}
            </div>
            <div class="working-hours-actions"><span class="working-hours-feedback" data-edit-feedback role="status" aria-live="polite"></span><button class="btn btn-solid" type="submit">Enregistrer</button></div>
        </form>`;
    document.body.append(modal);
    const form = modal.querySelector("form");
    const initialContacts = booking.contacts?.length ? booking.contacts : [{
        name: booking.clientDisplayName || booking.guestName || booking.guestContact?.name || "",
        email: booking.clientEmail || booking.guestContact?.email || "",
        role: "primary",
        notify: true
    }];
    const feedback = modal.querySelector("[data-edit-feedback]");
    const contactEditor = initializeBookingContactEditor(modal.querySelector("[data-booking-contacts]"), initialContacts, {
        async onInvite(contact) {
            try {
                await httpsCallable(getFirebaseFunctions(), "issueBookingClaim")({ bookingId: booking.id, contactId: contact.contactId, requestId: createRequestId() });
                feedback.textContent = UI_STRINGS.proDashboard.bookingCreation.claimInvitationQueued;
            } catch {
                feedback.textContent = UI_STRINGS.proDashboard.bookingCreation.claimInvitationError;
            }
        }
    });
    form.start.value = toDateTimeLocal(booking.start);
    form.end.value = toDateTimeLocal(booking.end);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (new Date(form.end.value) <= new Date(form.start.value)) {
            feedback.textContent = UI_STRINGS.proDashboard.bookingCreation.invalidRange;
            return;
        }
        try {
            const result = await httpsCallable(getFirebaseFunctions(), "updateProfessionalBooking")({
                requestId: createRequestId(),
                bookingId: booking.id,
                contacts: contactEditor.getContacts(),
                start: form.start.value,
                end: form.end.value,
                seriesScope: form.seriesScope?.value || "this"
            });
            const affectedCount = result.data?.affectedBookingIds?.length || 1;
            feedback.textContent = affectedCount > 1 ? `${strings.editSaved} ${affectedCount} occurrences modifiées.` : strings.editSaved;
            window.setTimeout(() => { modal.remove(); onSaved?.(); }, 400);
        } catch {
            feedback.textContent = strings.editError;
        }
    });
    modal.querySelector("[data-edit-close]").addEventListener("click", () => modal.remove());
}

function toDateTimeLocal(value) {
    if (!value) return "";
    const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (part) => String(part).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function createRequestId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}