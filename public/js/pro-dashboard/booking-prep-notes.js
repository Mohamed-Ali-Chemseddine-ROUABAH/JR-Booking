import { UI_STRINGS } from "../core/strings-fr.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { getFirebaseFunctions } from "../core/firebase-init.js";
import { attachModalBehavior } from "../shared/modal-behavior.js?v=modal-a11y-20260924";

const strings = UI_STRINGS.proDashboard.prepNotes;

export function initializeBookingPrepNotes({ booking, onSaved }) {
    const modal = document.createElement("div");
    modal.className = "booking-creation-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<form class="glass booking-creation-dialog" aria-labelledby="prep-notes-title"><div class="working-hours-header"><h2 id="prep-notes-title">${strings.title}</h2><button class="icon-button modal-close" type="button" data-prep-notes-close aria-label="${strings.close}" title="${strings.close}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg></button></div><p class="admin-panel-help">${strings.help}</p><label class="working-hours-field"><span>${strings.label}</span><textarea name="prepNotes" rows="8" maxlength="2000"></textarea></label><div class="working-hours-actions"><span class="working-hours-feedback" data-prep-notes-feedback role="status"></span><button class="btn btn-solid" type="submit">${strings.save}</button></div></form>`;
    document.body.append(modal);
    attachModalBehavior(modal);

    const form = modal.querySelector("form");
    const feedback = modal.querySelector("[data-prep-notes-feedback]");
    const submit = form.querySelector("button[type=submit]");
    form.prepNotes.disabled = true;
    submit.disabled = true;
    httpsCallable(getFirebaseFunctions(), "getBookingPrepNotes")({ bookingId: booking.id }).then((result) => {
        form.prepNotes.value = result.data.prepNotes || "";
        form.prepNotes.disabled = false;
        submit.disabled = false;
    }).catch(() => {
        feedback.textContent = strings.error;
    });
    modal.querySelector("[data-prep-notes-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        form.querySelector("button[type=submit]").disabled = true;
        try {
            await httpsCallable(getFirebaseFunctions(), "updateBookingPrepNotes")({ bookingId: booking.id, prepNotes: form.prepNotes.value.trim().slice(0, 2000) });
            feedback.textContent = strings.saved;
            onSaved?.();
        } catch {
            feedback.textContent = strings.error;
            form.querySelector("button[type=submit]").disabled = false;
        }
    });
    return modal;
}
