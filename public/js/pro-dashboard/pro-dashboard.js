import { requireAuth, signOutCurrentUser } from "../core/auth-guard.js";
import { collection, doc, getDocs, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirebaseFunctions, getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js?v=mockup-parity-b-20260924";
import { showNotification } from "../shared/notifications.js?v=undo-20260907";
import { initializeSchedule } from "../schedule/schedule-render.js?v=mockup-parity-b-20260924";
import { initializeSidebarFeed } from "../sidebar/sidebar-feed.js?v=verified-client-booking-20260926";
import { initializeProNavbar, setNavbarUnread } from "./navbar-pro.js?v=mockup-parity-b-20260924";
import { initializeWorkingHours } from "./working-hours.js?v=mockup-parity-20260924";
import { initializePersonalInfo } from "./personal-info.js?v=mockup-parity-20260924";
import { initializePaymentInfo } from "./payment-info.js?v=mockup-parity-20260924";
import { initializeMovementInfo } from "./movement-info.js?v=mockup-parity-20260924";
import { initializeServicesPackages } from "./services-packages.js?v=mockup-parity-20260924";
import { initializeIntakeQuestionnaire } from "./intake-questionnaire.js?v=mockup-parity-20260924";
import { initializeQuickReplies } from "./quick-replies.js?v=mockup-parity-20260924";
import { initializeDelegatedAccess } from "./delegated-access.js?v=mockup-parity-20260924";
import { initializeDirectLinks } from "./direct-links.js?v=mockup-parity-20260924";
import { initializeClientDatabase } from "./client-database.js?v=mockup-parity-20260924";
import { initializeStatistics } from "./statistics.js?v=mockup-parity-20260924";
import { initializeNotificationPreferences } from "./notification-preferences.js?v=mockup-parity-20260924";
import { initializeSupportRequests } from "../shared/support-requests.js?v=mockup-parity-20260924";
import { initializeBookingCreation } from "./booking-creation.js?v=mockup-parity-20260924";
import { updateBookingStatus, updateBookingDetails } from "./booking-actions.js";
import { initializeBookingEdit } from "./booking-edit.js?v=mockup-parity-20260924";
import { openBookingContextMenu } from "./booking-context-menu.js";
import { calculateMovementQuote } from "./movement-pricing.js";
import { applyClientPricingOverrides } from "./client-pricing.mjs";
import { normalizeCustomPaymentLinks } from "../core/payment-links.js";
import { initializeCalendarSync, loadGoogleCalendarEvents } from "../schedule/schedule-gcal-sync.js?v=mockup-parity-20260924";
import { buildProfessionalScheduleReport, openPrintDocument } from "../shared/print-reports.js?v=print-report-20260909";
import { buildProfessionalDataExport, downloadJsonFile } from "../shared/export-data.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { getIdTokenResult } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeBookingMessages } from "../shared/booking-messages.js?v=mockup-parity-20260924";
import { initializeBookingPrepNotes } from "./booking-prep-notes.js?v=mockup-parity-20260924";
import { initializeTodayView, initializeNotificationCenter } from "./today-view.js?v=verified-client-booking-20260926";

const strings = UI_STRINGS.proDashboard;
const layout = document.querySelector("[data-dashboard-layout]");
const status = document.querySelector("[data-dashboard-status]");

document.title = strings.pageTitle;
status.textContent = strings.loading;

requireAuth({
    allowedRoles: ["professional"],
    onAuthorized: async ({ user }) => {
        const tokenResult = await getIdTokenResult(user, true);
        const delegatedProfileIds = tokenResult.claims.delegate === true
            ? (Array.isArray(tokenResult.claims.delegateProfileIds) ? tokenResult.claims.delegateProfileIds.map(String) : [String(tokenResult.claims.delegateProfileId || "")]).filter(Boolean)
            : [];
        const ownedProfiles = await loadOwnedProfiles(user.uid, tokenResult.claims.professional === true);
        const ownedProfileIds = new Set(ownedProfiles.map((profile) => profile.id));
        const delegatedProfiles = delegatedProfileIds.filter((id) => !ownedProfileIds.has(id)).map((id) => ({ id, displayName: `Profil délégué · ${id.slice(0, 8)}` }));
        const profiles = [...ownedProfiles, ...delegatedProfiles];
        const storedProfileId = sessionStorage.getItem("jr-active-professional-profile");
        const activeProfileId = profiles.some((profile) => profile.id === storedProfileId) ? storedProfileId : (profiles[0]?.id || user.uid);
        const isDelegate = delegatedProfiles.some((profile) => profile.id === activeProfileId);
        const profileUser = { ...user, uid: activeProfileId };
        let delegateAccess = isDelegate ? await loadDelegatedBookings(activeProfileId) : null;
        const canManageBookings = !isDelegate || delegateAccess.permissions.includes("manageBookings");
        const canManageMessages = !isDelegate || delegateAccess.permissions.includes("manageMessages");
        let dashboardBookings = [];
        initializeProNavbar(document.querySelector("[data-pro-navbar]"), {
            user: profileUser,
            profiles,
            activeProfileId,
            canManageSettings: !isDelegate,
            onNotifications: () => initializeNotificationCenter(document.body, { bookings: dashboardBookings, timezone: workingHours?.timezone || "Europe/Paris", userId: user.uid, onSelectBooking: (bookingId) => sidebar?.selectBooking(bookingId) }),
            onSupportRequests: () => initializeSupportRequests({ user }),
            onProfileChange: (profileId) => {
                sessionStorage.setItem("jr-active-professional-profile", profileId);
                window.location.reload();
            },
            onLogout: handleLogout,
            onPrint: ({ mode, anonymizeClients }) => openPrintDocument(buildProfessionalScheduleReport({ professionalName: user.displayName || user.email, bookings: dashboardBookings, mode, anonymizeClients, strings: UI_STRINGS.proDashboard.navbar.printReport })),
            onWorkingHours: () => initializeWorkingHours({ user: profileUser }),
            onPaymentInfo: () => initializePaymentInfo({ user: profileUser }),
            onMovementInfo: () => initializeMovementInfo({ user: profileUser }),
            onServices: () => initializeServicesPackages({ user: profileUser }),
            onIntake: () => initializeIntakeQuestionnaire({ user: profileUser }),
            onQuickReplies: () => initializeQuickReplies({ user: profileUser }),
            onDelegatedAccess: () => initializeDelegatedAccess({ user: profileUser }),
            onDirectLinks: () => initializeDirectLinks({ user: profileUser }),
            onPersonalInfo: () => initializePersonalInfo({ user: profileUser }),
            onExportData: () => downloadJsonFile(`jr-booking-${activeProfileId}-data.json`, buildProfessionalDataExport({ user, profileId: activeProfileId, bookings: dashboardBookings })),
            onClientDatabase: () => initializeClientDatabase({ user: profileUser, timezone: workingHours?.timezone || "Europe/Paris" }),
            onStatistics: () => initializeStatistics({ user: profileUser }),
            onNotificationPreferences: () => initializeNotificationPreferences({ user })
        });
        const workingHours = await loadWorkingHours(activeProfileId);
        const bookings = delegateAccess?.bookings || await loadBookings(activeProfileId);
        const calendarEvents = await loadCalendarEvents();
        dashboardBookings = bookings;
        setNavbarUnread(document.querySelector("[data-pro-navbar]"), bookings.filter((booking) => booking.status === "pending").length);
        initializeTodayView(document.querySelector("[data-today-root]"), bookings, workingHours.timezone);
        let sidebar;
        document.querySelector("[data-today-root]").addEventListener("today-booking-selected", (event) => sidebar?.selectBooking(event.detail));
        let activeFilter = "pending";
        const renderDashboard = (currentBookings) => {
            sidebar = initializeSidebarFeed(document.querySelector("[data-sidebar-root]"), {
                bookings: currentBookings,
                onToggleSidebar: collapseSidebar,
                onStatusChange: canManageBookings ? handleBookingStatus : undefined,
                onBatchStatus: canManageBookings ? handleBatchStatus : undefined,
                initialFilter: activeFilter,
                onFilterChange: (filter) => { activeFilter = filter; },
                onMessages: canManageMessages ? (booking) => initializeBookingMessages({ booking, userId: user.uid, profileId: activeProfileId, userRole: "professional" }) : undefined,
                onPrepNotes: isDelegate ? undefined : (booking) => initializeBookingPrepNotes({ booking, onSaved: refreshDashboard }),
                onEditBooking: canManageBookings ? (booking) => initializeBookingEdit({ booking, timezone: workingHours?.timezone || "Europe/Paris", onSaved: refreshDashboard }) : undefined
            });
            initializeSchedule(document.querySelector("[data-schedule-root]"), {
                daysToShow: workingHours.viewDays,
                timezone: workingHours.timezone,
                workingHours,
                bookings: currentBookings,
                calendarEvents,
                onExpandSidebar: expandSidebar,
                onSelectBooking: (bookingId) => sidebar.selectBooking(bookingId),
                onBookingContextMenu: ({ bookingId, x, y }) => {
                    const booking = currentBookings.find((item) => item.id === bookingId);
                    openBookingContextMenu({
                        booking,
                        x,
                        y,
                        onStatusChange: canManageBookings ? handleBookingStatus : undefined,
                        onEdit: canManageBookings ? (selectedBooking) => initializeBookingEdit({ booking: selectedBooking, timezone: workingHours?.timezone || "Europe/Paris", onSaved: refreshDashboard }) : undefined,
                        onPrepNotes: isDelegate ? undefined : (selectedBooking) => initializeBookingPrepNotes({ booking: selectedBooking, onSaved: refreshDashboard })
                    });
                },
                onCalendarSync: () => initializeCalendarSync({ user: profileUser }),
                onCalendarRangeChange: ({ from, to }) => loadCalendarEvents({ from, to }),
                onSyncCalendar: canManageBookings ? syncBookingToCalendar : undefined,
                onMeetingLinks: canManageBookings ? manageMeetingLinks : undefined,
                onPrepNotes: isDelegate ? undefined : (booking) => initializeBookingPrepNotes({ booking, onSaved: refreshDashboard }),
                onCreateBooking: isDelegate ? undefined : (details) => initializeBookingCreation({ user: profileUser, details, timezone: workingHours?.timezone || "Europe/Paris", onSaved: refreshDashboard })
            });
        };
        const refreshDashboard = async () => {
            if (isDelegate) delegateAccess = await loadDelegatedBookings(activeProfileId);
            const updatedBookings = delegateAccess?.bookings || await loadBookings(activeProfileId);
            dashboardBookings = updatedBookings;
            setNavbarUnread(document.querySelector("[data-pro-navbar]"), updatedBookings.filter((booking) => booking.status === "pending").length);
            initializeTodayView(document.querySelector("[data-today-root]"), updatedBookings, workingHours.timezone);
            renderDashboard(updatedBookings);
        };
        const handleBookingStatus = async (bookingId, nextStatus, previousStatus, { silent = false } = {}) => {
            if (nextStatus === "rejected" && !window.confirm(strings.sidebar.rejectConfirmation)) return;
            try {
                await updateBookingStatus(bookingId, nextStatus);
                await refreshDashboard();
                if (silent) return;
                showNotification(strings.sidebar.actionSaved, "success", {
                    label: strings.sidebar.undoAction,
                    onClick: async () => {
                        try {
                            await updateBookingStatus(bookingId, previousStatus);
                            await refreshDashboard();
                            showNotification(strings.sidebar.undoSaved, "success");
                        } catch {
                            showNotification(strings.sidebar.actionError, "error");
                        }
                    }
                });
            } catch {
                showNotification(strings.sidebar.actionError, "error");
            }
        };

        const handleBatchStatus = async (selectedBookings, nextStatus) => {
            try {
                await httpsCallable(getFirebaseFunctions(), "batchUpdateBookingStatus")({ bookingIds: selectedBookings.map((booking) => booking.id), status: nextStatus });
                await refreshDashboard();
                showNotification(strings.sidebar.batchSaved, "success");
            } catch {
                showNotification(strings.sidebar.actionError, "error");
            }
        };

        async function syncBookingToCalendar(booking) {
            try {
                await httpsCallable(getFirebaseFunctions(), "syncBookingToGoogleCalendar")({ bookingId: booking.id });
                showNotification(strings.sidebar.syncCalendarBookingSaved, "success");
            } catch {
                showNotification(strings.sidebar.syncCalendarBookingError, "error");
            }
        }
        renderDashboard(bookings);
        status.textContent = "";
    }
});

async function loadOwnedProfiles(authUid, includePrimaryFallback = true) {
    try {
        const snapshot = await getDocs(query(collection(getFirestoreDb(), "proProfiles"), where("owners", "array-contains", authUid)));
        const profiles = snapshot.docs.map((item) => ({ id: item.id, ...item.data(), displayName: item.data().personalInfo?.displayName || item.data().displayName || item.id }));
        if (includePrimaryFallback && !profiles.some((profile) => profile.id === authUid)) profiles.unshift({ id: authUid, displayName: "Profil principal" });
        return profiles;
    } catch {
        return includePrimaryFallback ? [{ id: authUid, displayName: "Profil principal" }] : [];
    }
}

async function loadCalendarEvents({ from = new Date(), to } = {}) {
    from = new Date(from);
    from.setHours(0, 0, 0, 0);
    to = to ? new Date(to) : new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
    try {
        return await loadGoogleCalendarEvents({ from, to });
    } catch {
        return [];
    }
}

async function loadWorkingHours(userId) {
    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", userId));
        const settings = snapshot.data()?.workingHours || {};
        return {
            ...settings,
            viewDays: Math.min(7, Math.max(1, Number(settings.viewDays) || 7)),
            workingDays: Array.isArray(settings.workingDays) ? settings.workingDays : [1, 2, 3, 4, 5],
            startTime: settings.startTime || "09:00",
            endTime: settings.endTime || "17:00",
            recurringBreak: settings.recurringBreak || { start: "12:00", end: "13:00" }
        };
    } catch {
        return { viewDays: 7 };
    }
}

function collapseSidebar() {
    layout.classList.add("is-sidebar-collapsed");
}

function expandSidebar() {
    layout.classList.remove("is-sidebar-collapsed");
}

async function handleLogout() {
    try {
        await signOutCurrentUser();
        window.location.assign("login.html");
    } catch (error) {
        showNotification(UI_STRINGS.auth.errors.generic, "error");
    }
}

async function loadBookings(userId) {
    try {
        const snapshot = await getDocs(query(collection(getFirestoreDb(), "bookings"), where("proId", "==", userId)));
        const bookings = snapshot.docs.map((booking) => ({ id: booking.id, ...booking.data() }));
        const profileSnapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", userId));
        const movementInfo = profileSnapshot.data()?.movementInfo;
        const paymentInfo = profileSnapshot.data()?.paymentInfo;
        const clientRecordsSnapshot = await getDocs(query(collection(getFirestoreDb(), "proClientRecords"), where("proId", "==", userId)));
        const clientRecords = Object.fromEntries(clientRecordsSnapshot.docs.map((record) => [record.data().clientId, record.data()]));
        if ((!movementInfo?.movement || !movementInfo.address) && !paymentInfo?.enabled) {
            return bookings;
        }
        return Promise.all(bookings.map((booking) => saveBookingContext(booking, movementInfo, paymentInfo, clientRecords[booking.clientId] || {})));
    } catch {
        return [];
    }
}

async function saveBookingContext(booking, movementInfo, paymentInfo, clientRecord = {}) {
    if (booking.status === "rejected") {
        return booking;
    }
    let movementQuote = booking.movementQuote;
    if (!movementQuote && movementInfo?.movement && movementInfo.address && booking.clientAddress) {
        movementQuote = await calculateMovementQuote({
            originAddress: movementInfo.address,
            destinationAddress: booking.clientAddress,
            zones: movementInfo.zones || []
        });
    }
    const paymentContext = paymentInfo?.enabled ? buildPaymentContext(booking, paymentInfo, movementQuote, clientRecord) : null;
    if (!movementQuote && !paymentContext) return booking;
    const updates = {};
    if (movementQuote && !booking.movementQuote) updates.movementQuote = movementQuote;
    if (paymentContext && JSON.stringify(paymentContext) !== JSON.stringify(booking.paymentContext || null)) updates.paymentContext = paymentContext;
    if (!Object.keys(updates).length) return { ...booking, movementQuote, paymentContext: booking.paymentContext };
    await updateBookingDetails(booking.id, updates);
    return { ...booking, ...updates };
}

function buildPaymentContext(booking, paymentInfo, movementQuote, clientRecord) {
    const durationHours = Math.round(((new Date(booking.end) - new Date(booking.start)) / 3600000) * 100) / 100;
    const { ratePerUnit, surcharge } = applyClientPricingOverrides({ paymentInfo, movementQuote, clientRecord });
    return {
        bankTransfer: Boolean(paymentInfo.bankTransfer),
        rib: paymentInfo.bankTransfer ? paymentInfo.rib : "",
        wero: Boolean(paymentInfo.wero),
        weroPhone: paymentInfo.wero ? paymentInfo.weroPhone : "",
        banks: Array.isArray(paymentInfo.banks) ? paymentInfo.banks : [],
        customPaymentLinks: normalizeCustomPaymentLinks(paymentInfo),
        ratePerUnit,
        durationHours,
        surcharge,
        balance: Math.round((ratePerUnit * durationHours + surcharge) * 100) / 100
    };
}

async function manageMeetingLinks(booking) {
    const raw = window.prompt(strings.sidebar.meetingLinksPrompt, (booking.meetingLinks || []).map((link) => `${link.label}|${link.url}`).join("\n"));
    if (raw === null) return;
    const links = raw.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
        const [label, url] = line.split("|");
        return { label: (label || "Réunion").trim(), url: (url || label || "").trim() };
    });
    try {
        await httpsCallable(getFirebaseFunctions(), "updateBookingMeetingLinks")({ bookingId: booking.id, links });
        showNotification(strings.sidebar.meetingLinksSaved, "success");
    } catch { showNotification(strings.sidebar.meetingLinksError, "error"); }
}

async function loadDelegatedBookings(profileId) {
    const result = await httpsCallable(getFirebaseFunctions(), "listDelegatedBookings")({ profileId });
    return result.data;
}