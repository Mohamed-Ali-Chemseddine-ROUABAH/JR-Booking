import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.workingHours;
const defaultSettings = {
    workingDays: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "17:00",
    viewDays: 7,
    bufferMinutes: 0,
    timezone: "Europe/Paris",
    recurringBreak: { start: "12:00", end: "13:00" },
    absences: [],
    exceptions: []
};

export async function initializeWorkingHours({ user }) {
    const modal = createModal();
    const form = modal.querySelector("form");
    const feedback = modal.querySelector("[data-working-hours-feedback]");

    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", user.uid));
        populateForm(form, normalizeSettings(snapshot.exists() ? snapshot.data().workingHours : defaultSettings));
    } catch {
        feedback.textContent = strings.loadError;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        feedback.textContent = "";

        try {
            await setDoc(doc(getFirestoreDb(), "proProfiles", user.uid), {
                owners: [user.uid],
                workingHours: readForm(form)
            }, { merge: true });
            feedback.textContent = strings.saved;
        } catch {
            feedback.textContent = strings.saveError;
        }
    });

    modal.querySelector("[data-working-hours-close]").addEventListener("click", () => modal.remove());
    modal.querySelector("[data-add-absence]").addEventListener("click", () => addAbsenceRow(modal.querySelector("[data-absences]")));
    modal.querySelector("[data-add-exception]").addEventListener("click", () => addExceptionRow(modal.querySelector("[data-exceptions]")));
    modal.addEventListener("click", (event) => {
        if (event.target.matches("[data-remove-row]")) {
            event.target.closest(".working-hours-repeatable-row").remove();
        }
    });
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

function createModal() {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <form class="glass working-hours-dialog" aria-labelledby="working-hours-title">
            <div class="working-hours-header">
                <h2 id="working-hours-title">${strings.title}</h2>
                <button class="btn btn-ghost" type="button" data-working-hours-close>${strings.close}</button>
            </div>
            <section class="working-hours-section">
                <h3>${strings.daysLabel}</h3>
                <div class="working-hours-days">
                    ${strings.weekdays.map((day, index) => `<label class="working-hours-day"><input type="checkbox" name="workingDay" value="${index + 1}">${day}</label>`).join("")}
                </div>
                <div class="working-hours-fields">
                    ${field("startTime", "time", strings.startLabel)}
                    ${field("endTime", "time", strings.endLabel)}
                    ${field("viewDays", "number", strings.viewDaysLabel, "1", "7")}
                    ${field("bufferMinutes", "number", strings.bufferLabel, "0", "120")}
                    <label class="working-hours-field"><span>${strings.timezoneLabel}</span><select name="timezone"><option value="Europe/Paris">Europe/Paris</option><option value="UTC">UTC</option><option value="America/Montreal">America/Montreal</option></select></label>
                </div>
            </section>
            <section class="working-hours-section">
                <h3>${strings.breakTitle}</h3>
                <div class="working-hours-fields">
                    ${field("breakStart", "time", strings.breakStartLabel)}
                    ${field("breakEnd", "time", strings.breakEndLabel)}
                </div>
            </section>
            <section class="working-hours-section">
                <h3>${strings.absenceTitle}</h3>
                <div class="working-hours-repeatable-list" data-absences></div>
                <button class="btn btn-ghost working-hours-add" type="button" data-add-absence>${strings.addAbsence}</button>
            </section>
            <section class="working-hours-section">
                <h3>${strings.exceptionTitle}</h3>
                <div class="working-hours-repeatable-list" data-exceptions></div>
                <button class="btn btn-ghost working-hours-add" type="button" data-add-exception>${strings.addException}</button>
            </section>
            <div class="working-hours-actions">
                <span class="working-hours-feedback" data-working-hours-feedback role="status" aria-live="polite"></span>
                <button class="btn btn-solid" type="submit">${strings.save}</button>
            </div>
        </form>
    `;
    document.body.append(modal);
    return modal;
}

function field(name, type, label, min = "", max = "", required = true) {
    return `<label class="working-hours-field"><span>${label}</span><input name="${name}" type="${type}"${min ? ` min="${min}"` : ""}${max ? ` max="${max}"` : ""}${required ? " required" : ""}></label>`;
}

function populateForm(form, settings) {
    form.startTime.value = settings.startTime;
    form.endTime.value = settings.endTime;
    form.viewDays.value = settings.viewDays;
    form.bufferMinutes.value = settings.bufferMinutes;
    form.timezone.value = settings.timezone;
    form.breakStart.value = settings.recurringBreak.start;
    form.breakEnd.value = settings.recurringBreak.end;
    settings.absences.forEach((absence) => addAbsenceRow(form.closest(".working-hours-modal").querySelector("[data-absences]"), absence));
    settings.exceptions.forEach((exception) => addExceptionRow(form.closest(".working-hours-modal").querySelector("[data-exceptions]"), exception));
    form.querySelectorAll("[name='workingDay']").forEach((input) => {
        input.checked = settings.workingDays.includes(Number(input.value));
    });
}

function readForm(form) {
    return {
        workingDays: [...form.querySelectorAll("[name='workingDay']:checked")].map((input) => Number(input.value)),
        startTime: form.startTime.value,
        endTime: form.endTime.value,
        viewDays: Number(form.viewDays.value),
        bufferMinutes: Math.min(120, Math.max(0, Number(form.bufferMinutes.value) || 0)),
        timezone: form.timezone.value,
        recurringBreak: { start: form.breakStart.value, end: form.breakEnd.value },
        absences: [...form.querySelectorAll("[data-absence-row]")].map((row) => ({
            start: row.querySelector("[name='absenceStart']").value,
            end: row.querySelector("[name='absenceEnd']").value,
            reason: row.querySelector("[name='absenceReason']").value.trim()
        })).filter((absence) => absence.start || absence.end || absence.reason),
        exceptions: [...form.querySelectorAll("[data-exception-row]")].map((row) => ({
            date: row.querySelector("[name='exceptionDate']").value,
            start: row.querySelector("[name='exceptionStart']").value,
            end: row.querySelector("[name='exceptionEnd']").value
        })).filter((exception) => exception.date)
    };
}

function normalizeSettings(settings = {}) {
    const absences = Array.isArray(settings.absences)
        ? settings.absences
        : settings.absence?.start || settings.absence?.end || settings.absence?.reason
            ? [settings.absence]
            : [];
    return { ...defaultSettings, ...settings, absences, exceptions: Array.isArray(settings.exceptions) ? settings.exceptions : [] };
}

function addAbsenceRow(container, absence = {}) {
    const row = document.createElement("div");
    row.className = "working-hours-repeatable-row";
    row.dataset.absenceRow = "true";
    row.innerHTML = `${field("absenceStart", "date", strings.absenceStartLabel, "", "", false)}${field("absenceEnd", "date", strings.absenceEndLabel, "", "", false)}<label class="working-hours-field"><span>${strings.absenceReasonLabel}</span><input name="absenceReason" type="text"></label><button class="btn btn-ghost" type="button" data-remove-row>${strings.removeAbsence}</button>`;
    row.querySelector("[name='absenceStart']").value = absence.start || "";
    row.querySelector("[name='absenceEnd']").value = absence.end || "";
    row.querySelector("[name='absenceReason']").value = absence.reason || "";
    container.append(row);
}

function addExceptionRow(container, exception = {}) {
    const row = document.createElement("div");
    row.className = "working-hours-repeatable-row";
    row.dataset.exceptionRow = "true";
    row.innerHTML = `${field("exceptionDate", "date", strings.exceptionDateLabel)}${field("exceptionStart", "time", strings.exceptionStartLabel)}${field("exceptionEnd", "time", strings.exceptionEndLabel)}<button class="btn btn-ghost" type="button" data-remove-row>${strings.removeException}</button>`;
    row.querySelector("[name='exceptionDate']").value = exception.date || "";
    row.querySelector("[name='exceptionStart']").value = exception.start || "";
    row.querySelector("[name='exceptionEnd']").value = exception.end || "";
    container.append(row);
}