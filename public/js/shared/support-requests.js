import { addDoc, collection, getDocs, query, serverTimestamp, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { normalizeRequestFields } from "./support-request-policy.mjs";

const strings = UI_STRINGS.supportRequests;

export function buildRequestPayload({ subject, details, createdBy }) {
    const fields = normalizeRequestFields({ subject, details, createdBy });
    return {
        ...fields,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };
}

export function initializeSupportRequests({ user }) {
    const modal = document.createElement("div");
    modal.className = "modal-backdrop";
    modal.innerHTML = `
        <section class="glass working-hours-dialog" aria-labelledby="support-requests-title">
            <div class="working-hours-header">
                <h2 id="support-requests-title">${strings.title}</h2>
                <button class="btn btn-ghost" type="button" data-support-close>${strings.close}</button>
            </div>
            <form data-support-form>
                <label class="working-hours-field"><span>${strings.typeLabel}</span><select name="requestType"><option value="support">${strings.support}</option><option value="data">${strings.data}</option></select></label>
                <label class="working-hours-field"><span>${strings.subjectLabel}</span><input name="subject" maxlength="120" placeholder="${strings.subjectPlaceholder}" required></label>
                <label class="working-hours-field"><span>${strings.detailsLabel}</span><textarea name="details" maxlength="2000" rows="6" placeholder="${strings.detailsPlaceholder}" required></textarea></label>
                <p class="working-hours-feedback" data-support-feedback role="status" aria-live="polite"></p>
                <div class="working-hours-actions"><button class="btn btn-solid" type="submit">${strings.submit}</button></div>
            </form>
        </section>`;
    document.body.append(modal);

    const form = modal.querySelector("[data-support-form]");
    const feedback = modal.querySelector("[data-support-feedback]");
    const history = document.createElement("div");
    history.className = "support-request-history";
    modal.querySelector("section").append(history);
    modal.querySelector("[data-support-close]").addEventListener("click", () => modal.remove());
    loadRequestHistory(history, user?.uid);
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submit = form.querySelector("button[type=submit]");
        const values = new FormData(form);
        try {
            const payload = buildRequestPayload({ subject: values.get("subject"), details: values.get("details"), createdBy: user?.uid });
            submit.disabled = true;
            const collectionName = values.get("requestType") === "data" ? "dataRequests" : "supportTickets";
            await addDoc(collection(getFirestoreDb(), collectionName), payload);
            feedback.textContent = strings.saved;
            form.reset();
            loadRequestHistory(history, user?.uid);
        } catch {
            feedback.textContent = strings.error;
        } finally {
            submit.disabled = false;
        }
    });
}

async function loadRequestHistory(container, uid) {
    if (!uid) return;
    try {
        const [tickets, requests] = await Promise.all(["supportTickets", "dataRequests"].map((name) => getDocs(query(collection(getFirestoreDb(), name), where("createdBy", "==", uid)))));
        const items = [...tickets.docs, ...requests.docs].map((item) => ({ id: item.id, ...item.data() })).sort((left, right) => String(right.updatedAt || right.createdAt || "").localeCompare(String(left.updatedAt || left.createdAt || "")));
        container.innerHTML = items.length ? `<h3>${strings.historyTitle}</h3>${items.map((item) => `<article class="support-request-history-item"><strong>${escapeHtml(item.subject)}</strong><small>${escapeHtml(item.status || "pending")}</small>${item.adminReply ? `<p>${escapeHtml(item.adminReply)}</p>` : ""}</article>`).join("")}` : `<p class="working-hours-feedback">${strings.historyEmpty}</p>`;
    } catch {
        container.innerHTML = `<p class="working-hours-feedback">${strings.historyError}</p>`;
    }
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}
