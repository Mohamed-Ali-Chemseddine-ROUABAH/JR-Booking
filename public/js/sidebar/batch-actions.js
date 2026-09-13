import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.sidebar;

export async function applyBatchStatus(bookings, status, onBatchStatus) {
    if (!bookings.length) return;
    const label = status === "accepted" ? strings.acceptBooking : strings.rejectBooking;
    if (!window.confirm(`${label} ${bookings.length} réservation(s) sélectionnée(s) ?`)) return;
    await onBatchStatus(bookings, status);
}
