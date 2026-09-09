import { requireAuth, signOutCurrentUser } from "../core/auth-guard.js";
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { showNotification } from "../shared/notifications.js";
import { initializeClientNavbar } from "./navbar-client.js?v=payment-context-20260909";
import { initializeClientBookings } from "./client-bookings.js";
import { initializeClientProfileSettings } from "./client-profile-settings.js";
import { initializeRequestChange } from "./client-request-change.js";
import { updateClientBookingStatus } from "../pro-dashboard/booking-actions.js";
import { initializeClientSchedule } from "./client-schedule.js";
import { initializeClientPaymentContext } from "./client-payment-context.js";
import { initializeProfessionalSearch } from "./client-professional-search.js";

const strings = UI_STRINGS.clientDashboard;
const status = document.querySelector("[data-dashboard-status]");

document.title = strings.pageTitle;
status.textContent = strings.loading;

// Clients hold no custom claim; getUserRole falls back to "authenticated" for any signed-in non-pro/non-admin user.
requireAuth({
    allowedRoles: ["client", "authenticated"],
    onAuthorized: async ({ user }) => {
        let activeFilter = "pending";
        let currentBookings = await loadBookings(user.uid);
        let savedProfessionals = await loadSavedProfessionals(user.uid);
        let lockedProfessional = null;

        initializeClientNavbar(document.querySelector("[data-client-navbar]"), {
            user,
            onLogout: handleLogout,
            onEditProfile: () => initializeClientProfileSettings({ user }),
            onPayment: () => initializeClientPaymentContext({ bookings: currentBookings })
        });
        renderSchedule();
        renderBookings(activeFilter);
        renderProfessionalSearch();
        status.textContent = "";

        async function refresh() {
            currentBookings = await loadBookings(user.uid);
            renderSchedule();
            renderBookings(activeFilter);
        }

        function renderSchedule() {
            initializeClientSchedule(document.querySelector("[data-client-schedule-root]"), { bookings: currentBookings, lockedProfessional });
        }

        function renderBookings(filter) {
            initializeClientBookings(document.querySelector("[data-client-bookings-root]"), {
                userId: user.uid,
                bookings: currentBookings,
                initialFilter: filter,
                onFilterChange: (nextFilter) => { activeFilter = nextFilter; },
                onAccept: (booking) => handleAccept(booking),
                onCancel: (booking) => handleCancel(booking),
                onRequestChange: (booking) => initializeRequestChange({ booking, onSaved: refresh })
            });
        }

        function renderProfessionalSearch() {
            initializeProfessionalSearch(document.querySelector("[data-client-professional-search]"), {
                savedProfessionals,
                lockedProId: lockedProfessional?.proId || null,
                lockedDisplayName: lockedProfessional?.displayName || null,
                lockedIdTag: lockedProfessional?.idTag || null,
                onLock: handleLock,
                onUnlock: handleUnlock,
                onSave: handleSave,
                onRemove: handleRemove
            });
        }

        async function handleLock(proId, displayName, idTag) {
            const busySlots = await loadBusySlots(proId);
            lockedProfessional = { proId, displayName, idTag, busySlots };
            renderSchedule();
            renderProfessionalSearch();
        }

        function handleUnlock() {
            lockedProfessional = null;
            renderSchedule();
            renderProfessionalSearch();
        }

        async function handleSave(proId, displayName, idTag) {
            if (savedProfessionals.some((item) => item.proId === proId)) return;
            const entry = { proId, displayName, idTag: idTag || null };
            savedProfessionals = [...savedProfessionals, entry];
            renderProfessionalSearch();
            try {
                await setDoc(doc(getFirestoreDb(), "clientAccounts", user.uid), { savedProfessionals: arrayUnion(entry) }, { merge: true });
            } catch {
                showNotification(strings.bookings.actionError, "error");
            }
        }

        async function handleRemove(proId) {
            const entry = savedProfessionals.find((item) => item.proId === proId);
            savedProfessionals = savedProfessionals.filter((item) => item.proId !== proId);
            renderProfessionalSearch();
            if (!entry) return;
            try {
                await setDoc(doc(getFirestoreDb(), "clientAccounts", user.uid), { savedProfessionals: arrayRemove(entry) }, { merge: true });
            } catch {
                showNotification(strings.bookings.actionError, "error");
            }
        }

        async function handleAccept(booking) {
            try {
                await updateClientBookingStatus(booking.id, "accepted");
                await refresh();
                showNotification(strings.bookings.actionSaved, "success");
            } catch {
                showNotification(strings.bookings.actionError, "error");
            }
        }

        async function handleCancel(booking) {
            if (!window.confirm(strings.bookings.cancelConfirmation)) return;
            try {
                await updateClientBookingStatus(booking.id, "rejected");
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

async function loadSavedProfessionals(userId) {
    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "clientAccounts", userId));
        return snapshot.data()?.savedProfessionals || [];
    } catch {
        return [];
    }
}

async function loadBusySlots(proId) {
    try {
        const snapshot = await getDocs(collection(getFirestoreDb(), "busySlots", proId, "slots"));
        return snapshot.docs.map((slot) => slot.data());
    } catch {
        return [];
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
