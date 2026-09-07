import { UI_STRINGS } from "../core/strings-fr.js";
import { updateBookingDetails } from "./booking-actions.js";

const strings = UI_STRINGS.proDashboard.sidebar;

export function initializeBookingEdit({ booking, onSaved }) {
    const modal = document.createElement("div");
    modal.className = "booking-creation-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <form class="glass booking-creation-dialog" aria-labelledby="booking-edit-title">
            <div class="working-hours-header"><h2 id="booking-edit-title">${strings.editTitle}</h2><button class="btn btn-ghost" type="button" data-edit-close>Fermer</button></div>
            <div class="working-hours-fields">
                <label class="working-hours-field"><span>Nom du client</span><input name="clientName" type="text" required></label>
                <label class="working-hours-field"><span>Adresse courriel</span><input name="clientEmail" type="email" required></label>
                <label class="working-hours-field"><span>Début</span><input name="start" type="datetime-local" required></label>
                <label class="working-hours-field"><span>Fin</span><input name="end" type="datetime-local" required></label>
            </div>
            <div class="working-hours-actions"><span class="working-hours-feedback" data-edit-feedback role="status" aria-live="polite"></span><button class="btn btn-solid" type="submit">Enregistrer</button></div>
        </form>`;
    document.body.append(modal);
    const form = modal.querySelector("form");
    form.clientName.value = booking.clientDisplayName || booking.guestName || booking.guestContact?.name || "";
    form.clientEmail.value = booking.clientEmail || booking.guestContact?.email || "";
    form.start.value = toDateTimeLocal(booking.start);
    form.end.value = toDateTimeLocal(booking.end);
    const feedback = modal.querySelector("[data-edit-feedback]");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (new Date(form.end.value) <= new Date(form.start.value)) {
            feedback.textContent = UI_STRINGS.proDashboard.bookingCreation.invalidRange;
            return;
        }
        try {
            await updateBookingDetails(booking.id, {
                guestContact: { name: form.clientName.value.trim(), email: form.clientEmail.value.trim() },
                start: form.start.value,
                end: form.end.value
            });
            feedback.textContent = strings.editSaved;
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