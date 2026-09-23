import { UI_STRINGS } from "../core/strings-fr.js";
import { updateBookingDetails } from "../pro-dashboard/booking-actions.js";
import { isLocalDateTimeRangeValid, isoToZonedLocal, zonedLocalToIso } from "../core/datetime-utils.mjs";

const strings = UI_STRINGS.clientDashboard.requestChange;

export function initializeRequestChange({ booking, timezone = "Europe/Paris", onSaved }) {
    const modal = document.createElement("div");
    modal.className = "booking-creation-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <form class="glass booking-creation-dialog" aria-labelledby="request-change-title">
            <div class="working-hours-header">
                <h2 id="request-change-title">${strings.title}</h2>
                <button class="btn btn-ghost" type="button" data-request-change-close>${strings.close}</button>
            </div>
            <div class="working-hours-fields">
                <label class="working-hours-field"><span>${strings.startLabel}</span><input name="start" type="datetime-local" required></label>
                <label class="working-hours-field"><span>${strings.endLabel}</span><input name="end" type="datetime-local" required></label>
            </div>
            <div class="working-hours-actions">
                <span class="working-hours-feedback" data-request-change-feedback role="status" aria-live="polite"></span>
                <button class="btn btn-solid" type="submit">${strings.save}</button>
            </div>
        </form>
    `;
    document.body.append(modal);

    const form = modal.querySelector("form");
    form.start.value = toDateTimeLocal(booking.start, timezone);
    form.end.value = toDateTimeLocal(booking.end, timezone);
    const feedback = modal.querySelector("[data-request-change-feedback]");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const start = form.start.value;
        const end = form.end.value;
        if (!isLocalDateTimeRangeValid(start, end)) {
            feedback.textContent = strings.invalidRange;
            return;
        }

        try {
            // Keeps status pending so the professional reviews the newly proposed time before it is synced.
            await updateBookingDetails(booking.id, { start: zonedLocalToIso(start, timezone), end: zonedLocalToIso(end, timezone), status: "pending" });
            feedback.textContent = strings.saved;
            window.setTimeout(() => {
                modal.remove();
                onSaved?.();
            }, 400);
        } catch {
            feedback.textContent = strings.error;
        }
    });

    modal.querySelector("[data-request-change-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

function toDateTimeLocal(value, timezone) {
    return isoToZonedLocal(value, timezone);
}
