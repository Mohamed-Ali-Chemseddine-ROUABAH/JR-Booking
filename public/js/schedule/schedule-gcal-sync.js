import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirebaseFunctions, getFirestoreDb } from "../core/firebase-init.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.calendarSync;

export async function loadGoogleCalendarEvents({ from, to }) {
    const result = await httpsCallable(getFirebaseFunctions(), "syncGoogleCalendar")({
        from: from.toISOString(),
        to: to.toISOString()
    });
    return Array.isArray(result.data?.events) ? result.data.events : [];
}

export async function initializeCalendarSync({ user }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<section class="glass working-hours-dialog calendar-sync-dialog" aria-labelledby="calendar-sync-title"><div class="working-hours-header"><h2 id="calendar-sync-title">${strings.title}</h2><button class="btn btn-ghost" type="button" data-calendar-close>${strings.close}</button></div><p class="calendar-sync-state"><strong>${strings.notConnected}</strong><span>${strings.notConnectedHelp}</span></p><section class="working-hours-section"><h3>${strings.displayTitle}</h3><label class="working-hours-field"><span>${strings.modeLabel}</span><select name="calendarMode"><option value="ghost">${strings.ghostMode}</option><option value="solid">${strings.solidMode}</option></select></label><label class="working-hours-field"><span>${strings.reminderLabel}</span><select name="reminderMinutes"><option value="0">${strings.reminderNone}</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 heure</option></select></label></section><div class="working-hours-actions"><span class="working-hours-feedback" data-calendar-feedback role="status"></span><button class="btn btn-solid" type="button" data-calendar-save>${strings.save}</button><button class="btn btn-ghost" type="button" data-calendar-connect>${strings.connect}</button></div></section>`;
    document.body.append(modal);
    const feedback = modal.querySelector("[data-calendar-feedback]");
    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", user.uid));
        const settings = snapshot.data()?.calendarSettings || {};
        modal.querySelector("[name='calendarMode']").value = settings.mode || "ghost";
        modal.querySelector("[name='reminderMinutes']").value = String(settings.reminderMinutes || 0);
    } catch {
        feedback.textContent = strings.loadError;
    }
    modal.querySelector("[data-calendar-save]").addEventListener("click", async () => {
        try {
            await setDoc(doc(getFirestoreDb(), "proProfiles", user.uid), { calendarSettings: { mode: modal.querySelector("[name='calendarMode']").value, reminderMinutes: Number(modal.querySelector("[name='reminderMinutes']").value) } }, { merge: true });
            feedback.textContent = strings.saved;
        } catch {
            feedback.textContent = strings.saveError;
        }
    });
    modal.querySelector("[data-calendar-connect]").addEventListener("click", async () => {
        const button = modal.querySelector("[data-calendar-connect]");
        button.disabled = true;
        feedback.textContent = strings.connecting;
        try {
            const result = await httpsCallable(getFirebaseFunctions(), "getGoogleCalendarAuthUrl")({});
            window.location.assign(result.data.url);
        } catch (error) {
            feedback.textContent = error?.code === "functions/failed-precondition" ? strings.oauthUnavailable : strings.connectError;
            button.disabled = false;
        }
    });
    modal.querySelector("[data-calendar-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
}