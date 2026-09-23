import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { getFirebaseFunctions } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { initializeBookingContactEditor } from "./booking-contacts.js";
import { isLocalDateTimeRangeValid, zonedLocalToIso } from "../core/datetime-utils.mjs";

const strings = UI_STRINGS.proDashboard.bookingCreation;

export function initializeBookingCreation({ user, details, timezone = "Europe/Paris", onSaved }) {
    const modal = document.createElement("div");
    modal.className = "booking-creation-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <form class="glass booking-creation-dialog" aria-labelledby="booking-creation-title">
            <div class="working-hours-header">
                <h2 id="booking-creation-title">${strings.title}</h2>
                <button class="btn btn-ghost" type="button" data-booking-close>${strings.close}</button>
            </div>
            <div data-booking-contacts></div>
            <div class="working-hours-fields">
                <label class="working-hours-field"><span>${strings.startLabel}</span><input name="start" type="datetime-local" value="${toDateTimeValue(details.date, details.hour)}" required></label>
                <label class="working-hours-field"><span>${strings.endLabel}</span><input name="end" type="datetime-local" value="${toDateTimeValue(details.date, details.endHour || nextHour(details.hour))}" required></label>
            </div>
            <div class="working-hours-actions">
                <span class="working-hours-feedback" data-booking-feedback role="status" aria-live="polite"></span>
                <button class="btn btn-solid" type="submit">${strings.save}</button>
            </div>
        </form>
    `;
    document.body.append(modal);

    const form = modal.querySelector("form");
    const feedback = modal.querySelector("[data-booking-feedback]");
    const contactEditor = initializeBookingContactEditor(modal.querySelector("[data-booking-contacts]"));
    const requestId = createRequestId();
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const start = formData.get("start");
        const end = formData.get("end");
        if (!isLocalDateTimeRangeValid(start, end)) {
            feedback.textContent = strings.invalidRange;
            return;
        }

        try {
            await httpsCallable(getFirebaseFunctions(), "createProfessionalBooking")({
                requestId,
                proId: user.uid,
                contacts: contactEditor.getContacts(),
                start: zonedLocalToIso(start, timezone),
                end: zonedLocalToIso(end, timezone)
            });
            feedback.textContent = strings.saved;
            window.setTimeout(() => {
                modal.remove();
                onSaved?.();
            }, 400);
        } catch {
            feedback.textContent = strings.error;
        }
    });

    modal.querySelector("[data-booking-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

function toDateTimeValue(date, hour) {
    return `${date}T${hour}`;
}

function nextHour(hour) {
    const [hours, minutes] = hour.split(":").map(Number);
    return `${String(hours + 1).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function createRequestId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}