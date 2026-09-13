import { requireAuth, signOutCurrentUser } from "../core/auth-guard.js";
import { collection, doc, getDocs, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirebaseFunctions, getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { showNotification } from "../shared/notifications.js?v=undo-20260907";
import { initializeSchedule } from "../schedule/schedule-render.js?v=ui-controls-20260913";
import { initializeSidebarFeed } from "../sidebar/sidebar-feed.js";
import { initializeProNavbar } from "./navbar-pro.js?v=crm-20260909";
import { initializeWorkingHours } from "./working-hours.js";
import { initializePersonalInfo } from "./personal-info.js";
import { initializePaymentInfo } from "./payment-info.js";
import { initializeMovementInfo } from "./movement-info.js";
import { initializeServicesPackages } from "./services-packages.js";
import { initializeIntakeQuestionnaire } from "./intake-questionnaire.js";
import { initializeQuickReplies } from "./quick-replies.js";
import { initializeDelegatedAccess } from "./delegated-access.js";
import { initializeDirectLinks } from "./direct-links.js";
import { initializeClientDatabase } from "./client-database.js?v=crm-erasure-20260909";
import { initializeStatistics } from "./statistics.js?v=stats-20260909";
import { initializeBookingCreation } from "./booking-creation.js";
import { updateBookingStatus, updateBookingDetails } from "./booking-actions.js";
import { initializeBookingEdit } from "./booking-edit.js";
import { openBookingContextMenu } from "./booking-context-menu.js";
import { calculateMovementQuote } from "./movement-pricing.js";
import { normalizeCustomPaymentLinks } from "../core/payment-links.js";
import { initializeCalendarSync, loadGoogleCalendarEvents } from "../schedule/schedule-gcal-sync.js?v=calendar-sync-20260910b";
import { buildProfessionalScheduleReport, openPrintDocument } from "../shared/print-reports.js?v=print-report-20260909";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { getIdTokenResult } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeBookingMessages } from "../shared/booking-messages.js";
import { initializeBookingPrepNotes } from "./booking-prep-notes.js";
import { initializeTodayView, initializeNotificationCenter } from "./today-view.js";

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
            onNotifications: () => initializeNotificationCenter(document.body, { bookings: dashboardBookings, userId: user.uid, onSelectBooking: (bookingId) => sidebar?.selectBooking(bookingId) }),
            onProfileChange: (profileId) => {
                sessionStorage.setItem("jr-active-professional-profile", profileId);
                window.location.reload();
            },
            onLogout: handleLogout,
            onPrint: () => openPrintDocument(buildProfessionalScheduleReport({ professionalName: user.displayName || user.email, bookings: dashboardBookings, strings: UI_STRINGS.proDashboard.navbar.printReport })),
            onWorkingHours: () => initializeWorkingHours({ user: profileUser }),
            onPaymentInfo: () => initializePaymentInfo({ user: profileUser }),
            onMovementInfo: () => initializeMovementInfo({ user: profileUser }),
            onServices: () => initializeServicesPackages({ user: profileUser }),
            onIntake: () => initializeIntakeQuestionnaire({ user: profileUser }),
            onQuickReplies: () => initializeQuickReplies({ user: profileUser }),
            onDelegatedAccess: () => initializeDelegatedAccess({ user: profileUser }),
            onDirectLinks: () => initializeDirectLinks({ user: profileUser }),
            onPersonalInfo: () => initializePersonalInfo({ user: profileUser }),
            onClientDatabase: () => initializeClientDatabase({ user: profileUser }),
            onStatistics: () => initializeStatistics({ user: profileUser })
        });
        const workingHours = await loadWorkingHours(activeProfileId);
        const bookings = delegateAccess?.bookings || await loadBookings(activeProfileId);
        const calendarEvents = await loadCalendarEvents();
        dashboardBookings = bookings;
        initializeTodayView(document.querySelector("[data-today-root]"), bookings);
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
                onEditBooking: canManageBookings ? (booking) => initializeBookingEdit({ booking, onSaved: refreshDashboard }) : undefined
            });
            initializeSchedule(document.querySelector("[data-schedule-root]"), {
                daysToShow: workingHours.viewDays,
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
                        onEdit: canManageBookings ? (selectedBooking) => initializeBookingEdit({ booking: selectedBooking, onSaved: refreshDashboard }) : undefined,
                        onPrepNotes: isDelegate ? undefined : (selectedBooking) => initializeBookingPrepNotes({ booking: selectedBooking, onSaved: refreshDashboard })
                    });
                },
                onCalendarSync: () => initializeCalendarSync({ user: profileUser }),
                onCalendarRangeChange: ({ from, to }) => loadCalendarEvents({ from, to }),
                onSyncCalendar: canManageBookings ? syncBookingToCalendar : undefined,
                onMeetingLinks: canManageBookings ? manageMeetingLinks : undefined,
                onPrepNotes: isDelegate ? undefined : (booking) => initializeBookingPrepNotes({ booking, onSaved: refreshDashboard }),
                onCreateBooking: isDelegate ? undefined : (details) => initializeBookingCreation({ user: profileUser, details, onSaved: refreshDashboard })
            });
        };
        const refreshDashboard = async () => {
            if (isDelegate) delegateAccess = await loadDelegatedBookings(activeProfileId);
            const updatedBookings = delegateAccess?.bookings || await loadBookings(activeProfileId);
            dashboardBookings = updatedBookings;
            initializeTodayView(document.querySelector("[data-today-root]"), updatedBookings);
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
        if ((!movementInfo?.movement || !movementInfo.address) && !paymentInfo?.enabled) {
            return bookings;
        }
        return Promise.all(bookings.map((booking) => saveBookingContext(booking, movementInfo, paymentInfo)));
    } catch {
        return [];
    }
}

async function saveBookingContext(booking, movementInfo, paymentInfo) {
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
    const paymentContext = paymentInfo?.enabled ? buildPaymentContext(booking, paymentInfo, movementQuote) : null;
    if (!movementQuote && !paymentContext) return booking;
    const updates = {};
    if (movementQuote && !booking.movementQuote) updates.movementQuote = movementQuote;
    if (paymentContext && !booking.paymentContext) updates.paymentContext = paymentContext;
    if (!Object.keys(updates).length) return { ...booking, movementQuote, paymentContext: booking.paymentContext };
    await updateBookingDetails(booking.id, updates);
    return { ...booking, ...updates };
}

function buildPaymentContext(booking, paymentInfo, movementQuote) {
    const durationHours = Math.round(((new Date(booking.end) - new Date(booking.start)) / 3600000) * 100) / 100;
    const ratePerUnit = Number(paymentInfo.ratePerUnit) || 0;
    const surcharge = Number(movementQuote?.surcharge) || 0;
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