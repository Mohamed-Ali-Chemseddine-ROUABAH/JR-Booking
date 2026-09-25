import { requireAuth, signOutCurrentUser } from "../core/auth-guard.js";
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirebaseFunctions, getFirestoreDb } from "../core/firebase-init.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { UI_STRINGS } from "../core/strings-fr.js?v=mockup-parity-b-20260924";
import { showNotification } from "../shared/notifications.js";
import { initializeClientNavbar } from "./navbar-client.js?v=mockup-parity-b-20260924";
import { initializeClientBookings } from "./client-bookings.js?v=mockup-parity-20260924";
import { initializeClientProfileSettings } from "./client-profile-settings.js?v=mockup-parity-20260924";
import { initializeRequestChange } from "./client-request-change.js?v=mockup-parity-20260924";
import { updateClientBookingStatus } from "../pro-dashboard/booking-actions.js";
import { initializeClientSchedule } from "./client-schedule.js?v=mockup-parity-b-20260924";
import { initializeClientPaymentContext } from "./client-payment-context.js?v=mockup-parity-20260924";
import { initializeSupportRequests } from "../shared/support-requests.js?v=mockup-parity-20260924";
import { initializeNotificationPreferences } from "../pro-dashboard/notification-preferences.js?v=mockup-parity-20260924";
import { initializeNotificationCenter } from "../pro-dashboard/today-view.js?v=mockup-parity-20260924";
import { initializeProfessionalSearch } from "./client-professional-search.js?v=search-retract-20260914";
import { initializeHistoryShare } from "./client-history-share.js?v=mockup-parity-20260924";
import { initializeBookingMessages } from "../shared/booking-messages.js?v=mockup-parity-20260924";
import { buildProfessionalScheduleReport, openPrintDocument } from "../shared/print-reports.js?v=print-report-20260909";

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
        let clientTimezone = await loadClientTimezone(user.uid);
        let relationships = await loadRelationships(user.uid);
        let sharedBookings = await loadSharedBookings(user.uid, relationships);
        let lockedProfessional = null;
        let historyShareModal = null;

        initializeClientNavbar(document.querySelector("[data-client-navbar]"), {
            user,
            onLogout: handleLogout,
            onEditProfile: () => initializeClientProfileSettings({ user }),
            onPayment: () => initializeClientPaymentContext({ bookings: currentBookings, timezone: clientTimezone }),
            onHistoryShare: () => openHistoryShare(),
            onNotificationPreferences: () => initializeNotificationPreferences({ user }),
            onNotifications: () => initializeNotificationCenter(document.body, { bookings: [...currentBookings, ...sharedBookings], timezone: clientTimezone, userId: user.uid, onSelectBooking: (bookingId) => document.querySelector(`[data-booking-card="${bookingId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }) }),
            onSupportRequests: () => initializeSupportRequests({ user }),
            onPrint: ({ mode, anonymizeClients }) => openPrintDocument(buildProfessionalScheduleReport({
                professionalName: user.email,
                bookings: [...currentBookings, ...sharedBookings].map((booking) => ({ ...booking, clientDisplayName: booking.proDisplayName || "Professionnel" })),
                mode,
                anonymizeClients,
                strings: UI_STRINGS.proDashboard.navbar.printReport
            }))
        });
        renderSchedule();
        renderBookings(activeFilter);
        renderProfessionalSearch();
        status.textContent = "";

        async function refresh() {
            currentBookings = await loadBookings(user.uid);
            clientTimezone = await loadClientTimezone(user.uid);
            relationships = await loadRelationships(user.uid);
            sharedBookings = await loadSharedBookings(user.uid, relationships);
            renderSchedule();
            renderBookings(activeFilter);
        }

        function openHistoryShare() {
            historyShareModal?.remove();
            historyShareModal = initializeHistoryShare({
                userId: user.uid,
                relationships,
                onApprove: (item) => handleApproveHistoryShare(item),
                onRevoke: (item) => handleRevokeHistoryShare(item)
            });
        }

        function renderSchedule() {
            initializeClientSchedule(document.querySelector("[data-client-schedule-root]"), {
                bookings: currentBookings,
                lockedProfessional,
                timezone: clientTimezone,
                onLockedSlotSelect: ({ proId, date, start }) => {
                    const params = new URLSearchParams({ pro: proId, requestedDate: date, requestedStart: start });
                    window.location.assign(`profile.html?${params.toString()}`);
                }
            });
        }

        function renderBookings(filter) {
            initializeClientBookings(document.querySelector("[data-client-bookings-root]"), {
                userId: user.uid,
                timezone: clientTimezone,
                bookings: [...currentBookings, ...sharedBookings],
                initialFilter: filter,
                onFilterChange: (nextFilter) => { activeFilter = nextFilter; },
                onAccept: (booking) => handleAccept(booking),
                onCancel: (booking) => handleCancel(booking),
                onRequestChange: (booking) => initializeRequestChange({ booking, timezone: clientTimezone, onSaved: refresh }),
                onUnlinkClaim: (booking, contact) => handleUnlinkClaim(booking, contact),
                onRequestHistoryShare: (booking, linkedUid) => handleRequestHistoryShare(booking, linkedUid),
                onMessages: (booking, userRole) => initializeBookingMessages({ booking, userId: user.uid, userRole })
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

        async function handleUnlinkClaim(booking, contact) {
            if (!window.confirm(strings.bookings.unlinkClaimConfirmation)) return;
            try {
                await httpsCallable(getFirebaseFunctions(), "unlinkBookingClaim")({ bookingId: booking.id, contactId: contact.contactId, requestId: createRequestId() });
                await refresh();
                showNotification(strings.bookings.claimUnlinked, "success");
            } catch {
                showNotification(strings.bookings.actionError, "error");
            }
        }

        async function handleRequestHistoryShare(booking, linkedUid) {
            const contact = booking.contacts?.find((item) => item.linkedUid === linkedUid);
            const label = contact?.name || contact?.email || "";
            if (!window.confirm(strings.bookings.shareHistoryConfirmation(label))) return;
            const relationshipId = buildRelationshipKey(user.uid, linkedUid, "booking", booking.id);
            const contextLabel = booking.proDisplayName ? `${label} · ${booking.proDisplayName}` : label;
            try {
                await setDoc(doc(getFirestoreDb(), "clientRelationships", relationshipId), {
                    requesterUid: user.uid,
                    recipientUid: linkedUid,
                    scope: "booking",
                    bookingId: booking.id,
                    status: "pending",
                    contextLabel,
                    requestedAt: new Date(),
                    updatedAt: new Date()
                });
                relationships = await loadRelationships(user.uid);
                showNotification(strings.bookings.shareHistorySent, "success");
            } catch {
                showNotification(strings.bookings.actionError, "error");
            }
        }

        async function handleApproveHistoryShare(item) {
            if (!item) return;
            try {
                await updateDoc(doc(getFirestoreDb(), "clientRelationships", item.id), { status: "active", acceptedAt: new Date(), updatedAt: new Date() });
                await refresh();
                showNotification(UI_STRINGS.clientDashboard.historyShare.approved, "success");
                openHistoryShare();
            } catch {
                showNotification(UI_STRINGS.clientDashboard.historyShare.actionError, "error");
            }
        }

        async function handleRevokeHistoryShare(item) {
            if (!item) return;
            try {
                await updateDoc(doc(getFirestoreDb(), "clientRelationships", item.id), { status: "revoked", revokedAt: new Date(), revokedBy: user.uid, updatedAt: new Date() });
                await refresh();
                showNotification(UI_STRINGS.clientDashboard.historyShare.revoked, "success");
                openHistoryShare();
            } catch {
                showNotification(UI_STRINGS.clientDashboard.historyShare.actionError, "error");
            }
        }
    }
});

function buildRelationshipKey(uidA, uidB, scope, scopeId) {
    const [first, second] = uidA < uidB ? [uidA, uidB] : [uidB, uidA];
    return `${first}_${second}_${scope}_${scopeId}`;
}

async function loadBookings(userId) {
    try {
        const snapshot = await getDocs(query(collection(getFirestoreDb(), "bookings"), where("clientId", "==", userId)));
        const bookings = snapshot.docs.map((booking) => ({ id: booking.id, ...booking.data() }));
        return Promise.all(bookings.map(attachProDisplayName));
    } catch {
        return [];
    }
}

async function loadRelationships(userId) {
    try {
        const [asRequester, asRecipient] = await Promise.all([
            getDocs(query(collection(getFirestoreDb(), "clientRelationships"), where("requesterUid", "==", userId))),
            getDocs(query(collection(getFirestoreDb(), "clientRelationships"), where("recipientUid", "==", userId)))
        ]);
        const byId = new Map();
        [...asRequester.docs, ...asRecipient.docs].forEach((item) => byId.set(item.id, { id: item.id, ...item.data() }));
        return [...byId.values()].filter((item) => item.status !== "revoked");
    } catch {
        return [];
    }
}

async function loadSharedBookings(userId, relationships) {
    const active = relationships.filter((item) => item.status === "active");
    if (!active.length) return [];
    const results = await Promise.all(active.map(async (item) => {
        const otherUid = item.requesterUid === userId ? item.recipientUid : item.requesterUid;
        try {
            if (item.scope === "booking") {
                const snapshot = await getDoc(doc(getFirestoreDb(), "bookings", item.bookingId));
                return snapshot.exists() ? [await attachProDisplayName({ id: snapshot.id, ...snapshot.data() })] : [];
            }
            const constraints = [where("clientId", "==", otherUid)];
            if (item.scope === "professional") constraints.push(where("proId", "==", item.proId));
            const snapshot = await getDocs(query(collection(getFirestoreDb(), "bookings"), ...constraints));
            return Promise.all(snapshot.docs.map((booking) => attachProDisplayName({ id: booking.id, ...booking.data() })));
        } catch {
            return [];
        }
    }));
    const byId = new Map();
    results.flat().forEach((booking) => byId.set(booking.id, booking));
    return [...byId.values()];
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

async function loadClientTimezone(userId) {
    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "clientAccounts", userId));
        return snapshot.data()?.timezone || "Europe/Paris";
    } catch {
        return "Europe/Paris";
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

function createRequestId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
