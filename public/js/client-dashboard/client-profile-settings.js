import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";

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
                <button class="btn btn-ghost" type="button" data-profile-close>${strings.close}</button>
            </div>
            <div class="working-hours-fields">
                <label class="working-hours-field"><span>${strings.fullNameLabel}</span><input name="displayName" type="text"></label>
                <label class="working-hours-field"><span>${strings.timezoneLabel}</span><select name="timezone"><option value="Europe/Paris">Europe/Paris</option><option value="UTC">UTC</option><option value="America/Montreal">America/Montreal</option></select></label>
            </div>
            <div class="working-hours-actions">
                <span class="working-hours-feedback" data-profile-feedback role="status" aria-live="polite"></span>
                <button class="btn btn-solid" type="submit">${strings.save}</button>
            </div>
        </form>
    `;
    document.body.append(modal);

    const form = modal.querySelector("form");
    const feedback = modal.querySelector("[data-profile-feedback]");

    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "clientAccounts", user.uid));
        const data = snapshot.exists() ? snapshot.data() : {};
        form.displayName.value = data.displayName || user.displayName || "";
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
