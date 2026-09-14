import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { clearDraft, loadDraft, saveDraft } from "../core/draft-storage.mjs";

const strings = UI_STRINGS.proDashboard.intake;
const draftKey = (uid) => `jr-booking-intake-draft-${uid}`;

export async function initializeIntakeQuestionnaire({ user }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<form class="glass working-hours-dialog" aria-labelledby="intake-title"><div class="working-hours-header"><h2 id="intake-title">${strings.title}</h2><button class="btn btn-ghost" type="button" data-intake-close>${strings.close}</button></div><p class="admin-panel-help">${strings.help}</p><div class="working-hours-repeatable-list" data-intake-list></div><button class="btn btn-ghost working-hours-add" type="button" data-intake-add>${strings.add}</button><div class="working-hours-actions"><span class="working-hours-feedback" data-intake-feedback role="status"></span><button class="btn btn-solid" type="submit">${strings.save}</button></div></form>`;
    document.body.append(modal);
    const list = modal.querySelector("[data-intake-list]");
    const feedback = modal.querySelector("[data-intake-feedback]");
    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", user.uid));
        const draft = loadDraft(draftKey(user.uid));
        (draft?.questions || snapshot.data()?.intakeQuestionnaire?.questions || []).forEach((question) => addQuestionRow(list, question));
        if (draft) feedback.textContent = strings.draftRestored;
    } catch { feedback.textContent = strings.loadError; }
    const saveCurrentDraft = () => saveDraft(draftKey(user.uid), { questions: readQuestions(list) });
    modal.querySelector("[data-intake-add]").addEventListener("click", () => { addQuestionRow(list); saveCurrentDraft(); });
    modal.addEventListener("input", saveCurrentDraft);
    modal.addEventListener("click", (event) => { if (event.target.matches("[data-intake-remove]")) { event.target.closest("[data-intake-row]").remove(); saveCurrentDraft(); } });
    modal.querySelector("form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const questions = readQuestions(list);
            try { await setDoc(doc(getFirestoreDb(), "proProfiles", user.uid), { owners: [user.uid], intakeQuestionnaire: { questions } }, { merge: true }); await setDoc(doc(getFirestoreDb(), "publicProfiles", user.uid), { owners: [user.uid], intakeQuestionnaire: { questions }, updatedAt: new Date() }, { merge: true }); clearDraft(draftKey(user.uid)); feedback.textContent = strings.saved; } catch { feedback.textContent = strings.saveError; }
    });
    modal.querySelector("[data-intake-close]").addEventListener("click", () => modal.remove());
}

function addQuestionRow(container, question = {}) {
    const row = document.createElement("div");
    row.className = "working-hours-repeatable-row";
    row.dataset.intakeRow = "true";
    row.innerHTML = `<label class="working-hours-field"><span>${strings.question}</span><input name="questionText" required></label><label class="personal-info-checkbox"><input name="questionRequired" type="checkbox">${strings.required}</label><button class="btn btn-ghost" type="button" data-intake-remove>${strings.remove}</button>`;
    row.querySelector("[name='questionText']").value = question.text || "";
    row.querySelector("[name='questionRequired']").checked = question.required !== false;
    container.append(row);
}

function readQuestions(list) {
    return [...list.querySelectorAll("[data-intake-row]")].map((row) => ({ text: row.querySelector("[name='questionText']").value.trim(), required: row.querySelector("[name='questionRequired']").checked })).filter((question) => question.text).slice(0, 10);
}