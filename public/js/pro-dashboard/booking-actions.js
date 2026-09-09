import { arrayUnion, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";

export async function updateBookingStatus(bookingId, status) {
    await updateDoc(doc(getFirestoreDb(), "bookings", bookingId), { status, statusHistory: arrayUnion({ status, at: new Date().toISOString() }) });
}

export async function updateClientBookingStatus(bookingId, status) {
    await updateDoc(doc(getFirestoreDb(), "bookings", bookingId), { status });
}

export async function updateBookingDetails(bookingId, details) {
    await updateDoc(doc(getFirestoreDb(), "bookings", bookingId), details);
}