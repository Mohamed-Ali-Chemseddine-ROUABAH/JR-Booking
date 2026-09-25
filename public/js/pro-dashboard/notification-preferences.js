import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { attachModalBehavior } from "../shared/modal-behavior.js?v=modal-a11y-20260924";

const strings = UI_STRINGS.proDashboard.notificationPreferences;
const defaults = { messageEmail: "immediate", bookingEmail: "immediate", reminderEmail: "immediate" };
const modes = ["immediate", "digest", "none"];

export async function initializeNotificationPreferences({ user }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <section class="glass working-hours-dialog notification-preferences-dialog" aria-labelledby="notification-preferences-title">
            <div class="working-hours-header">
                <h2 id="notification-preferences-title">${strings.title}</h2>
                <button class="icon-button modal-close" type="button" data-preferences-close aria-label="${strings.close}" title="${strings.close}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg></button>
            </div>
            <p class="working-hours-feedback">${strings.help}</p>
            <form data-notification-preferences-form>
                <div class="working-hours-fields">
                    ${renderField("messageEmail", strings.messages)}
                    ${renderField("bookingEmail", strings.bookings)}
                    ${renderField("reminderEmail", strings.reminders)}
                </div>
                <p class="working-hours-feedback" data-preferences-feedback aria-live="polite"></p>
                <button class="btn btn-solid" type="submit">${strings.save}</button>
            </form>
        </section>
    `;
    document.body.append(modal);
    attachModalBehavior(modal);

    const form = modal.querySelector("[data-notification-preferences-form]");
    const feedback = modal.querySelector("[data-preferences-feedback]");
    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "notificationPreferences", user.uid));
        const preferences = { ...defaults, ...(snapshot.data() || {}) };
        Object.entries(preferences).forEach(([key, value]) => {
            const field = form.elements.namedItem(key);
            if (field && modes.includes(value)) field.value = value;
        });
    } catch {
        feedback.textContent = strings.loadError;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const preferences = Object.fromEntries(Object.keys(defaults).map((key) => [key, form.elements.namedItem(key).value]));
        try {
            await setDoc(doc(getFirestoreDb(), "notificationPreferences", user.uid), { ...preferences, updatedAt: new Date() }, { merge: true });
            feedback.textContent = strings.saved;
        } catch {
            feedback.textContent = strings.saveError;
        }
    });
    modal.querySelector("[data-preferences-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
}

function renderField(name, label) {
    return `<label class="working-hours-field"><span>${label}</span><select name="${name}"><option value="immediate">${strings.immediate}</option><option value="digest">${strings.digest}</option><option value="none">${strings.none}</option></select></label>`;
}
