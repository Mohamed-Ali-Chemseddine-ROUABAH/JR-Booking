import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { clearDraft, loadDraft, saveDraft } from "../core/draft-storage.mjs";
import { attachModalBehavior } from "../shared/modal-behavior.js?v=modal-a11y-20260924";

const strings = UI_STRINGS.proDashboard.services;
const draftKey = (uid) => `jr-booking-services-draft-${uid}`;

export async function initializeServicesPackages({ user }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<form class="glass working-hours-dialog" aria-labelledby="services-title"><div class="working-hours-header"><h2 id="services-title">${strings.title}</h2><button class="icon-button modal-close" type="button" data-services-close aria-label="${strings.close}" title="${strings.close}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg></button></div><p class="admin-panel-help">${strings.help}</p><div class="working-hours-repeatable-list" data-services-list></div><button class="btn btn-ghost working-hours-add" type="button" data-services-add>${strings.add}</button><div class="working-hours-actions"><span class="working-hours-feedback" data-services-feedback role="status"></span><button class="btn btn-solid" type="submit">${strings.save}</button></div></form>`;
    document.body.append(modal);
    attachModalBehavior(modal);
    const form = modal.querySelector("form");
    const list = modal.querySelector("[data-services-list]");
    const feedback = modal.querySelector("[data-services-feedback]");
    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", user.uid));
        const draft = loadDraft(draftKey(user.uid));
        (draft?.services || snapshot.data()?.services || []).forEach((service) => addServiceRow(list, service));
        if (draft) feedback.textContent = strings.draftRestored;
    } catch { feedback.textContent = strings.loadError; }
    const saveCurrentDraft = () => saveDraft(draftKey(user.uid), { services: readServices(list) });
    modal.querySelector("[data-services-add]").addEventListener("click", () => { addServiceRow(list); saveCurrentDraft(); });
    modal.addEventListener("input", saveCurrentDraft);
    modal.addEventListener("click", (event) => { if (event.target.matches("[data-service-remove]")) { event.target.closest("[data-service-row]").remove(); saveCurrentDraft(); } });
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const services = readServices(list);
        try {
            await setDoc(doc(getFirestoreDb(), "proProfiles", user.uid), { owners: [user.uid], services }, { merge: true });
            await setDoc(doc(getFirestoreDb(), "publicProfiles", user.uid), { owners: [user.uid], services, updatedAt: new Date() }, { merge: true });
            clearDraft(draftKey(user.uid));
            feedback.textContent = strings.saved;
        } catch { feedback.textContent = strings.saveError; }
    });
    modal.querySelector("[data-services-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
}

function addServiceRow(container, service = {}) {
    const row = document.createElement("div");
    row.className = "working-hours-repeatable-row";
    row.dataset.serviceRow = "true";
    row.innerHTML = `<label class="working-hours-field"><span>${strings.name}</span><input name="serviceName" required></label><label class="working-hours-field"><span>${strings.duration}</span><input name="serviceDuration" type="number" min="1" step="5" required></label><label class="working-hours-field"><span>${strings.price}</span><input name="servicePrice" type="number" min="0" step="0.01" required></label><button class="btn btn-ghost" type="button" data-service-remove>${strings.remove}</button>`;
    row.querySelector("[name='serviceName']").value = service.name || "";
    row.querySelector("[name='serviceDuration']").value = service.durationMinutes || 60;
    row.querySelector("[name='servicePrice']").value = service.price ?? 0;
    container.append(row);
}

function readServices(list) {
    return [...list.querySelectorAll("[data-service-row]")].map((row) => ({ name: row.querySelector("[name='serviceName']").value.trim(), durationMinutes: Number(row.querySelector("[name='serviceDuration']").value), price: Number(row.querySelector("[name='servicePrice']").value) })).filter((service) => service.name && service.durationMinutes > 0 && service.price >= 0);
}