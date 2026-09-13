import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { getFirebaseFunctions, getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.delegatedAccess;

export async function initializeDelegatedAccess({ user }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<section class="glass working-hours-dialog" aria-labelledby="delegated-access-title"><div class="working-hours-header"><h2 id="delegated-access-title">${strings.title}</h2><button class="btn btn-ghost" type="button" data-delegates-close>${strings.close}</button></div><p class="admin-panel-help">${strings.help}</p><div data-delegates-list></div><form class="working-hours-fields" data-delegate-form><label class="working-hours-field"><span>${strings.email}</span><input name="email" type="email" required></label><fieldset class="working-hours-field"><legend>${strings.permissions}</legend><label><input type="checkbox" name="manageBookings" checked> ${strings.manageBookings}</label><label><input type="checkbox" name="manageMessages"> ${strings.manageMessages}</label></fieldset><div class="working-hours-actions"><span class="working-hours-feedback" data-delegates-feedback role="status"></span><button class="btn btn-solid" type="submit">${strings.add}</button></div></form></section>`;
    document.body.append(modal);
    const list = modal.querySelector("[data-delegates-list]");
    const feedback = modal.querySelector("[data-delegates-feedback]");

    const render = async () => {
        try {
            const snapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", user.uid));
            const delegates = snapshot.data()?.delegates || {};
            list.innerHTML = Object.entries(delegates).map(([delegateUid, delegate]) => `<article class="glass-ghost sidebar-booking-card"><strong>${escapeHtml(delegate.displayName || delegate.email || delegateUid)}</strong><small>${escapeHtml(delegate.email || "")}</small><small>${(delegate.permissions || []).map((permission) => permission === "manageBookings" ? strings.manageBookings : strings.manageMessages).join(" · ")}</small><button class="btn btn-ghost" type="button" data-remove-delegate="${escapeHtml(delegateUid)}">${strings.remove}</button></article>`).join("") || `<p>${strings.empty}</p>`;
        } catch {
            list.innerHTML = `<p>${strings.loadError}</p>`;
        }
    };
    await render();
    modal.querySelector("[data-delegate-form]").addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const permissions = [form.manageBookings.checked ? "manageBookings" : "", form.manageMessages.checked ? "manageMessages" : ""].filter(Boolean);
        if (!permissions.length) {
            feedback.textContent = strings.permissionRequired;
            return;
        }
        form.querySelector("button[type=submit]").disabled = true;
        try {
            await httpsCallable(getFirebaseFunctions(), "addProfessionalDelegate")({ profileId: user.uid, email: form.email.value.trim(), permissions });
            feedback.textContent = strings.saved;
            form.reset();
            form.manageBookings.checked = true;
            await render();
        } catch {
            feedback.textContent = strings.error;
        } finally {
            form.querySelector("button[type=submit]").disabled = false;
        }
    });
    list.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-remove-delegate]");
        if (!button || !window.confirm(strings.removeConfirmation)) return;
        try {
            await httpsCallable(getFirebaseFunctions(), "removeProfessionalDelegate")({ profileId: user.uid, delegateUid: button.dataset.removeDelegate });
            feedback.textContent = strings.removed;
            await render();
        } catch {
            feedback.textContent = strings.error;
        }
    });
    modal.querySelector("[data-delegates-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
    return modal;
}

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character])); }
