import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { attachModalBehavior } from "../shared/modal-behavior.js?v=modal-a11y-20260924";

const strings = UI_STRINGS.proDashboard.quickReplies;
const MAX_QUICK_REPLIES = 20;

export async function initializeQuickReplies({ user }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<form class="glass working-hours-dialog" aria-labelledby="quick-replies-title"><div class="working-hours-header"><h2 id="quick-replies-title">${strings.title}</h2><button class="icon-button modal-close" type="button" data-quick-replies-close aria-label="${strings.close}" title="${strings.close}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg></button></div><p class="admin-panel-help">${strings.help}</p><div class="working-hours-repeatable-list" data-quick-replies-list></div><button class="btn btn-ghost working-hours-add" type="button" data-quick-replies-add>${strings.add}</button><div class="working-hours-actions"><span class="working-hours-feedback" data-quick-replies-feedback role="status"></span><button class="btn btn-solid" type="submit">${strings.save}</button></div></form>`;
    document.body.append(modal);
    attachModalBehavior(modal);

    const form = modal.querySelector("form");
    const list = modal.querySelector("[data-quick-replies-list]");
    const feedback = modal.querySelector("[data-quick-replies-feedback]");
    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", user.uid));
        (snapshot.data()?.quickReplies || []).slice(0, MAX_QUICK_REPLIES).forEach((reply) => addReplyRow(list, reply));
    } catch {
        feedback.textContent = strings.loadError;
    }

    modal.querySelector("[data-quick-replies-add]").addEventListener("click", () => {
        if (list.children.length < MAX_QUICK_REPLIES) addReplyRow(list);
    });
    modal.addEventListener("click", (event) => {
        if (event.target.matches("[data-quick-reply-remove]")) event.target.closest("[data-quick-reply-row]").remove();
    });
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const quickReplies = [...list.querySelectorAll("[data-quick-reply-row]")].map((row) => ({
            label: row.querySelector("[name='quickReplyLabel']").value.trim().slice(0, 80),
            body: row.querySelector("[name='quickReplyBody']").value.trim().slice(0, 1000)
        })).filter((reply) => reply.label && reply.body).slice(0, MAX_QUICK_REPLIES);
        try {
            await setDoc(doc(getFirestoreDb(), "proProfiles", user.uid), { quickReplies }, { merge: true });
            feedback.textContent = strings.saved;
        } catch {
            feedback.textContent = strings.saveError;
        }
    });
    modal.querySelector("[data-quick-replies-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
    return modal;
}

function addReplyRow(container, reply = {}) {
    const row = document.createElement("div");
    row.className = "working-hours-repeatable-row";
    row.dataset.quickReplyRow = "true";
    row.innerHTML = `<label class="working-hours-field"><span>${strings.label}</span><input name="quickReplyLabel" maxlength="80" required></label><label class="working-hours-field"><span>${strings.body}</span><textarea name="quickReplyBody" maxlength="1000" rows="3" required></textarea></label><button class="btn btn-ghost" type="button" data-quick-reply-remove>${strings.remove}</button>`;
    row.querySelector("[name='quickReplyLabel']").value = reply.label || "";
    row.querySelector("[name='quickReplyBody']").value = reply.body || "";
    container.append(row);
}
