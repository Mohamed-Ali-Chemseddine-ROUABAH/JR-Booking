import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { attachModalBehavior } from "../shared/modal-behavior.js?v=modal-a11y-20260924";

const strings = UI_STRINGS.clientDashboard.profileSettings;

export async function initializeClientProfileSettings({ user }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <form class="glass working-hours-dialog" aria-labelledby="client-profile-title">
            <div class="working-hours-header">
                <h2 id="client-profile-title">${strings.title}</h2>
                <button class="icon-button modal-close" type="button" data-profile-close aria-label="${strings.close}" title="${strings.close}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg></button>
            </div>
            <div class="working-hours-fields">
                <label class="working-hours-field"><span>${strings.fullNameLabel}</span><input name="displayName" type="text"></label>
                <label class="working-hours-field"><span>${strings.addressLabel}</span><input name="address" type="text"><small>Utilisée uniquement pour les réservations avec déplacement.</small></label>
                <label class="working-hours-field"><span>${strings.timezoneLabel}</span><select name="timezone"><option value="Europe/Paris">Europe/Paris</option><option value="UTC">UTC</option><option value="America/Montreal">America/Montreal</option></select></label>
            </div>
            <div class="working-hours-actions">
                <span class="working-hours-feedback" data-profile-feedback role="status" aria-live="polite"></span>
                <button class="btn btn-solid" type="submit">${strings.save}</button>
            </div>
        </form>
    `;
    document.body.append(modal);
    attachModalBehavior(modal);

    const form = modal.querySelector("form");
    const feedback = modal.querySelector("[data-profile-feedback]");

    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "clientAccounts", user.uid));
        const data = snapshot.exists() ? snapshot.data() : {};
        form.displayName.value = data.displayName || user.displayName || "";
        form.address.value = data.address || "";
        form.timezone.value = data.timezone || "Europe/Paris";
    } catch {
        feedback.textContent = strings.loadError;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        feedback.textContent = "";

        try {
            await setDoc(doc(getFirestoreDb(), "clientAccounts", user.uid), {
                displayName: form.displayName.value.trim(),
                address: form.address.value.trim(),
                timezone: form.timezone.value
            }, { merge: true });
            feedback.textContent = strings.saved;
        } catch {
            feedback.textContent = strings.saveError;
        }
    });

    modal.querySelector("[data-profile-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}
