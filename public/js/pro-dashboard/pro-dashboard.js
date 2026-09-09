import { requireAuth, signOutCurrentUser } from "../core/auth-guard.js";
import { collection, doc, getDocs, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { showNotification } from "../shared/notifications.js?v=undo-20260907";
import { initializeSchedule } from "../schedule/schedule-render.js";
import { initializeSidebarFeed } from "../sidebar/sidebar-feed.js";
import { initializeProNavbar } from "./navbar-pro.js";
import { initializeWorkingHours } from "./working-hours.js";
import { initializePersonalInfo } from "./personal-info.js";
import { initializePaymentInfo } from "./payment-info.js";
import { initializeMovementInfo } from "./movement-info.js";
import { initializeBookingCreation } from "./booking-creation.js";
import { updateBookingStatus, updateBookingDetails } from "./booking-actions.js";
import { initializeBookingEdit } from "./booking-edit.js";
import { openBookingContextMenu } from "./booking-context-menu.js";
import { calculateMovementQuote } from "./movement-pricing.js";

const strings = UI_STRINGS.proDashboard;
const layout = document.querySelector("[data-dashboard-layout]");
const status = document.querySelector("[data-dashboard-status]");

document.title = strings.pageTitle;
status.textContent = strings.loading;

requireAuth({
    allowedRoles: ["professional"],
    onAuthorized: async ({ user }) => {
        initializeProNavbar(document.querySelector("[data-pro-navbar]"), {
            user,
            onLogout: handleLogout,
            onWorkingHours: () => initializeWorkingHours({ user }),
            onPaymentInfo: () => initializePaymentInfo({ user }),
            onMovementInfo: () => initializeMovementInfo({ user }),
            onPersonalInfo: () => initializePersonalInfo({ user })
        });
        const workingHours = await loadWorkingHours(user.uid);
        const bookings = await loadBookings(user.uid);
        let sidebar;
        let activeFilter = "pending";
        const renderDashboard = (currentBookings) => {
            sidebar = initializeSidebarFeed(document.querySelector("[data-sidebar-root]"), {
                bookings: currentBookings,
                onToggleSidebar: collapseSidebar,
                onStatusChange: handleBookingStatus,
                initialFilter: activeFilter,
                onFilterChange: (filter) => { activeFilter = filter; },
                onEditBooking: (booking) => initializeBookingEdit({ booking, onSaved: refreshDashboard })
            });
            initializeSchedule(document.querySelector("[data-schedule-root]"), {
                daysToShow: workingHours.viewDays,
                workingHours,
                bookings: currentBookings,
                onExpandSidebar: expandSidebar,
                onSelectBooking: (bookingId) => sidebar.selectBooking(bookingId),
                onBookingContextMenu: ({ bookingId, x, y }) => {
                    const booking = currentBookings.find((item) => item.id === bookingId);
                    openBookingContextMenu({
                        booking,
                        x,
                        y,
                        onStatusChange: handleBookingStatus,
                        onEdit: (selectedBooking) => initializeBookingEdit({ booking: selectedBooking, onSaved: refreshDashboard })
                    });
                },
                onCreateBooking: (details) => initializeBookingCreation({ user, details, onSaved: refreshDashboard })
            });
        };
        const refreshDashboard = async () => {
            const updatedBookings = await loadBookings(user.uid);
            renderDashboard(updatedBookings);
        };
        const handleBookingStatus = async (bookingId, nextStatus, previousStatus) => {
            if (nextStatus === "rejected" && !window.confirm(strings.sidebar.rejectConfirmation)) return;
            try {
                await updateBookingStatus(bookingId, nextStatus);
                await refreshDashboard();
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
        renderDashboard(bookings);
        status.textContent = "";
    }
});

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
        customBankName: paymentInfo.customBankName || "",
        customBankUrl: paymentInfo.customBankUrl || "",
        ratePerUnit,
        durationHours,
        surcharge,
        balance: Math.round((ratePerUnit * durationHours + surcharge) * 100) / 100
    };
}