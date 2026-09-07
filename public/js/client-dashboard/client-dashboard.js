import { requireAuth, signOutCurrentUser } from "../core/auth-guard.js";
import { collection, doc, getDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { showNotification } from "../shared/notifications.js";
import { initializeClientNavbar } from "./navbar-client.js";
import { initializeClientBookings } from "./client-bookings.js";
import { initializeClientProfileSettings } from "./client-profile-settings.js";
import { initializeRequestChange } from "./client-request-change.js";
import { updateBookingStatus } from "../pro-dashboard/booking-actions.js";

const strings = UI_STRINGS.clientDashboard;
const status = document.querySelector("[data-dashboard-status]");

document.title = strings.pageTitle;
status.textContent = strings.loading;

// Clients hold no custom claim; getUserRole falls back to "authenticated" for any signed-in non-pro/non-admin user.
requireAuth({
    allowedRoles: ["client", "authenticated"],
    onAuthorized: async ({ user }) => {
        initializeClientNavbar(document.querySelector("[data-client-navbar]"), {
            user,
            onLogout: handleLogout,
            onEditProfile: () => initializeClientProfileSettings({ user })
        });

        let activeFilter = "pending";
        const bookings = await loadBookings(user.uid);
        renderBookings(user, bookings, activeFilter);
        status.textContent = "";

        async function refresh() {
            const updatedBookings = await loadBookings(user.uid);
            renderBookings(user, updatedBookings, activeFilter);
        }

        function renderBookings(currentUser, currentBookings, filter) {
            initializeClientBookings(document.querySelector("[data-client-bookings-root]"), {
                userId: currentUser.uid,
                bookings: currentBookings,
                initialFilter: filter,
                onFilterChange: (nextFilter) => { activeFilter = nextFilter; },
                onAccept: (booking) => handleAccept(booking),
                onCancel: (booking) => handleCancel(booking),
                onRequestChange: (booking) => initializeRequestChange({ booking, onSaved: refresh })
            });
        }

        async function handleAccept(booking) {
            try {
                await updateBookingStatus(booking.id, "accepted");
                await refresh();
                showNotification(strings.bookings.actionSaved, "success");
            } catch {
                showNotification(strings.bookings.actionError, "error");
            }
        }

        async function handleCancel(booking) {
            if (!window.confirm(strings.bookings.cancelConfirmation)) return;
            try {
                await updateBookingStatus(booking.id, "rejected");
                await refresh();
                showNotification(strings.bookings.actionSaved, "success");
            } catch {
                showNotification(strings.bookings.actionError, "error");
            }
        }
    }
});

async function loadBookings(userId) {
    try {
        const snapshot = await getDocs(query(collection(getFirestoreDb(), "bookings"), where("clientId", "==", userId)));
        const bookings = snapshot.docs.map((booking) => ({ id: booking.id, ...booking.data() }));
        return Promise.all(bookings.map(attachProDisplayName));
    } catch {
        return [];
    }
}

async function attachProDisplayName(booking) {
    if (!booking.proId) {
        return booking;
    }
    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "publicProfiles", booking.proId));
        return { ...booking, proDisplayName: snapshot.data()?.displayName };
    } catch {
        return booking;
    }
}

async function handleLogout() {
    try {
        await signOutCurrentUser();
        window.location.assign("login.html");
    } catch {
        showNotification(UI_STRINGS.auth.errors.generic, "error");
    }
}
