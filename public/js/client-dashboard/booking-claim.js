import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { getFirebaseFunctions } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { watchAuthState } from "../core/auth-guard.js";

const strings = UI_STRINGS.bookingClaim;
const status = document.querySelector("[data-claim-status]");
const summary = document.querySelector("[data-claim-summary]");
const actions = document.querySelector("[data-claim-actions]");
const loginLink = document.querySelector("[data-claim-login]");
const dashboardLink = document.querySelector("[data-claim-dashboard]");
const params = readClaimParams();

document.title = strings.pageTitle;
document.querySelector("[data-claim-eyebrow]").textContent = strings.eyebrow;
document.querySelector("[data-claim-title]").textContent = strings.title;
document.querySelector("[data-claim-intro]").textContent = strings.intro;
document.querySelector("[data-claim-panel-title]").textContent = strings.title;
document.querySelector("[data-claim-professional-label]").textContent = strings.professional;
document.querySelector("[data-claim-date-label]").textContent = strings.date;
document.querySelector("[data-claim-time-label]").textContent = strings.time;
document.querySelector("[data-claim-role-label]").textContent = strings.role;
document.querySelector("[data-claim-accept]").textContent = strings.accept;
document.querySelector("[data-claim-reject]").textContent = strings.reject;
loginLink.textContent = strings.signIn;
dashboardLink.textContent = strings.dashboard;
document.querySelector("[data-claim-home]").textContent = strings.backHome;

if (params) sessionStorage.setItem("jrBookingClaim", JSON.stringify(params));

watchAuthState(async (user) => {
    if (!user) {
        status.textContent = strings.signInRequired;
        loginLink.href = "login.html?returnTo=claim-booking.html";
        loginLink.hidden = false;
        return;
    }
    if (!params) {
        status.textContent = strings.invalid;
        return;
    }
    if (!user.emailVerified) {
        status.textContent = strings.verifiedEmailRequired;
        return;
    }
    await loadPreview();
});

document.querySelector("[data-claim-accept]").addEventListener("click", () => resolveClaim("accept"));
document.querySelector("[data-claim-reject]").addEventListener("click", () => resolveClaim("reject"));

async function loadPreview() {
    status.textContent = strings.loading;
    try {
        const response = await httpsCallable(getFirebaseFunctions(), "previewBookingClaim")(params);
        const booking = response.data;
        document.querySelector("[data-claim-professional]").textContent = booking.professionalName;
        const start = new Date(booking.start);
        const end = new Date(booking.end);
        document.querySelector("[data-claim-date]").textContent = start.toLocaleDateString("fr-FR");
        document.querySelector("[data-claim-time]").textContent = `${start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
        document.querySelector("[data-claim-role]").textContent = strings.contactRoles[booking.contactRole] || booking.contactRole;
        status.textContent = "";
        summary.hidden = false;
        actions.hidden = false;
    } catch (error) {
        status.textContent = error?.code === "functions/failed-precondition" && error?.message?.includes("verified") ? strings.verifiedEmailRequired : strings.invalid;
    }
}

async function resolveClaim(action) {
    actions.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    try {
        const response = await httpsCallable(getFirebaseFunctions(), "resolveBookingClaim")({ ...params, action, requestId: createRequestId() });
        const result = response.data;
        summary.hidden = true;
        actions.hidden = true;
        sessionStorage.removeItem("jrBookingClaim");
        status.textContent = result.status === "rejected"
            ? strings.rejected
            : result.status === "review-required"
                ? strings.reviewRequired
                : result.grantsBookingAccess ? strings.claimed : strings.linkedContact;
        dashboardLink.hidden = !result.grantsBookingAccess;
    } catch {
        status.textContent = strings.invalid;
        actions.querySelectorAll("button").forEach((button) => { button.disabled = false; });
    }
}

function readClaimParams() {
    const urlParams = new URLSearchParams(location.search);
    const bookingId = urlParams.get("booking");
    const token = urlParams.get("token");
    if (bookingId && token) return { bookingId, token };
    try {
        const stored = JSON.parse(sessionStorage.getItem("jrBookingClaim"));
        return stored?.bookingId && stored?.token ? stored : null;
    } catch {
        return null;
    }
}

function createRequestId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}