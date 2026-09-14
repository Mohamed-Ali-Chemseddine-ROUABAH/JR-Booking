import { collection, getDocs, query, updateDoc, doc, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirebaseFunctions, getFirestoreDb } from "../core/firebase-init.js?v=admin-provisioning-20260909";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { getAuthErrorMessage, requireAuth, signOutCurrentUser } from "../core/auth-guard.js";
import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.admin;
const status = document.querySelector("[data-admin-status]");
const requests = document.querySelector("[data-admin-requests]");
const audit = document.querySelector("[data-admin-audit]");
const claimConflicts = document.querySelector("[data-admin-conflicts]");
const tickets = document.querySelector("[data-admin-tickets]");
const dataRequests = document.querySelector("[data-admin-data-requests]");
const summary = document.querySelector("[data-admin-summary]");
const links = document.querySelector("[data-admin-links]");
const linkForm = document.querySelector("[data-admin-link-form]");
const linkFeedback = document.querySelector("[data-admin-link-feedback]");
const recoveryForm = document.querySelector("[data-admin-recovery-form]");
const recoveryFeedback = document.querySelector("[data-admin-recovery-feedback]");
const profileForm = document.querySelector("[data-admin-profile-form]");
const profileFeedback = document.querySelector("[data-admin-profile-feedback]");
const lifecycleForm = document.querySelector("[data-admin-lifecycle-form]");
const lifecycleFeedback = document.querySelector("[data-admin-lifecycle-feedback]");
const categories = document.querySelector("[data-admin-categories]");
const categoryForm = document.querySelector("[data-admin-category-form]");
const categoryFeedback = document.querySelector("[data-admin-category-feedback]");
const moderationForm = document.querySelector("[data-admin-moderation-form]");
const moderationFeedback = document.querySelector("[data-admin-moderation-feedback]");
const broadcastForm = document.querySelector("[data-admin-broadcast-form]");
const broadcastFeedback = document.querySelector("[data-admin-broadcast-feedback]");
const health = document.querySelector("[data-admin-health]");
let authorizedAdmin;

requireAuth({ allowedRoles: ["admin"], onAuthorized: async ({ user }) => {
    authorizedAdmin = user;
    renderNavbar(user);
    document.querySelector("[data-admin-summary-refresh]").addEventListener("click", loadSummary);
    document.querySelector("[data-admin-links-refresh]").addEventListener("click", loadCreationLinks);
    linkForm.addEventListener("submit", createCreationLink);
    recoveryForm.addEventListener("submit", issueAccountRecovery);
    profileForm.addEventListener("submit", createAdditionalProfile);
    lifecycleForm.addEventListener("submit", scheduleProfileErasure);
    lifecycleForm.querySelector("[data-admin-lifecycle-cancel]").addEventListener("click", cancelProfileErasure);
    lifecycleForm.querySelector("[data-admin-lifecycle-purge]").addEventListener("click", purgeProfile);
    document.querySelector("[data-admin-categories-refresh]").addEventListener("click", loadCategories);
    categoryForm.addEventListener("submit", renameCategory);
    moderationForm.addEventListener("submit", moderateProfile);
    broadcastForm.addEventListener("submit", queueBroadcast);
    document.querySelectorAll("[data-admin-bulk-review]").forEach((button) => button.addEventListener("click", () => bulkReview(button.dataset.adminBulkReview, user)));
        document.querySelector("[data-admin-health-refresh]").addEventListener("click", loadHealth);
    document.querySelector("[data-admin-refresh]").addEventListener("click", () => loadRequests(user));
    document.querySelector("[data-admin-audit-refresh]").addEventListener("click", loadAuditLogs);
    document.querySelector("[data-admin-conflicts-refresh]").addEventListener("click", loadClaimConflicts);
    document.querySelector("[data-admin-queues-refresh]").addEventListener("click", loadQueues);
    await loadRequests(user);
    await loadSummary();
    await loadCreationLinks();
    await loadAuditLogs();
    await loadClaimConflicts();
    await loadQueues();
    await loadCategories();
    await loadHealth();
} });

async function loadHealth() {
    health.innerHTML = `<p class="working-hours-feedback">${strings.health.loading}</p>`;
    try {
        const response = await httpsCallable(getFirebaseFunctions(), "getPlatformHealthSummary")();
        const data = response.data;
        const cards = [[strings.health.professionals, data.professionals], [strings.health.clients, data.clients], [strings.health.bookings, data.bookings], [strings.health.authUsers, data.authUsers], [strings.health.mailQueued, data.mailQueued], [strings.health.mailFailed, data.mailFailed], [strings.health.privilegedFailures, data.privilegedFailures], [strings.health.calendarErrors, data.calendarErrors], [strings.health.auditEvents, data.auditEvents]];
        health.innerHTML = cards.map(([label, count]) => `<article class="admin-summary-card"><strong>${Number(count) || 0}</strong><span>${escapeHtml(label)}</span></article>`).join("");
    } catch { health.innerHTML = `<p class="working-hours-feedback">${strings.health.error}</p>`; }
}

async function queueBroadcast(event) {
    event.preventDefault();
    if (!window.confirm(strings.broadcasts.confirmation)) return;
    const data = new FormData(broadcastForm);
    broadcastFeedback.textContent = strings.commandCenter.loading;
    try {
        await httpsCallable(getFirebaseFunctions(), "queuePlatformBroadcast")({ audience: data.get("audience"), subject: data.get("subject"), text: data.get("text") });
        broadcastFeedback.textContent = strings.broadcasts.queued;
        broadcastForm.reset();
    } catch { broadcastFeedback.textContent = strings.broadcasts.error; }
}

async function moderateProfile(event) {
    event.preventDefault();
    if (!window.confirm(strings.moderation.confirmation)) return;
    const data = new FormData(moderationForm);
    moderationFeedback.textContent = strings.commandCenter.loading;
    try {
        await httpsCallable(getFirebaseFunctions(), "moderatePublicProfile")({ profileId: data.get("profileId"), reason: data.get("reason"), redactDescription: data.get("redactDescription") === "on", redactAvatar: data.get("redactAvatar") === "on" });
        moderationFeedback.textContent = strings.moderation.applied;
        moderationForm.reset();
    } catch { moderationFeedback.textContent = strings.moderation.error; }
}

async function loadCategories() {
    categories.innerHTML = `<p class="working-hours-feedback">${strings.categories.loading}</p>`;
    try {
        const response = await httpsCallable(getFirebaseFunctions(), "listPlatformCategories")();
        const items = response.data.categories || [];
        categories.innerHTML = items.length ? `<div class="admin-category-list">${items.map((item) => `<span>${escapeHtml(item.name)} <strong>${item.count}</strong></span>`).join("")}</div>` : `<p class="working-hours-feedback">${strings.categories.empty}</p>`;
    } catch { categories.innerHTML = `<p class="working-hours-feedback">${strings.categories.error}</p>`; }
}

async function renameCategory(event) {
    event.preventDefault();
    const data = new FormData(categoryForm);
    if (!window.confirm(`Renommer « ${data.get("from")} » en « ${data.get("to")} » dans tous les profils ?`)) return;
    try {
        await httpsCallable(getFirebaseFunctions(), "renamePlatformCategory")({ from: data.get("from"), to: data.get("to") });
        categoryFeedback.textContent = strings.categories.renamed;
        categoryForm.reset();
        await loadCategories();
    } catch { categoryFeedback.textContent = strings.categories.error; }
}

async function scheduleProfileErasure(event) {
    event.preventDefault();
    const data = new FormData(lifecycleForm);
    lifecycleFeedback.textContent = strings.commandCenter.loading;
    try {
        await httpsCallable(getFirebaseFunctions(), "scheduleProfessionalProfileErasure")({ profileId: data.get("profileId"), confirmation: data.get("confirmation") });
        lifecycleFeedback.textContent = strings.lifecycle.scheduled;
    } catch { lifecycleFeedback.textContent = strings.lifecycle.error; }
}

async function cancelProfileErasure() {
    const profileId = lifecycleForm.elements.profileId.value.trim();
    if (!profileId) { lifecycleFeedback.textContent = strings.lifecycle.error; return; }
    try {
        await httpsCallable(getFirebaseFunctions(), "cancelProfessionalProfileErasure")({ profileId });
        lifecycleFeedback.textContent = strings.lifecycle.cancelled;
    } catch { lifecycleFeedback.textContent = strings.lifecycle.error; }
}

async function createAdditionalProfile(event) {
    event.preventDefault();
    const data = new FormData(profileForm);
    profileFeedback.textContent = strings.commandCenter.loading;
    try {
        await httpsCallable(getFirebaseFunctions(), "createAdditionalProfessionalProfile")({ ownerUid: data.get("ownerUid"), displayName: data.get("displayName"), description: data.get("description") });
        profileFeedback.textContent = strings.profiles.created;
        profileForm.reset();
    } catch { profileFeedback.textContent = strings.profiles.error; }
}

async function issueAccountRecovery(event) {
    event.preventDefault();
    const data = new FormData(recoveryForm);
    const wipeLinkedData = data.get("mode") === "wipe";
    if (!window.confirm(wipeLinkedData ? strings.accountRecovery.wipeConfirmation : strings.accountRecovery.confirmation)) return;
    const target = data.get("target").trim();
    recoveryFeedback.textContent = strings.commandCenter.loading;
    try {
        const payload = target.includes("@") ? { targetEmail: target } : { targetUid: target };
        payload.wipeLinkedData = wipeLinkedData;
        payload.confirmation = data.get("confirmation").trim();
        await httpsCallable(getFirebaseFunctions(), "issueAccountRecovery")(payload);
        recoveryFeedback.textContent = wipeLinkedData ? strings.accountRecovery.wipeQueued : strings.accountRecovery.queued;
        recoveryForm.reset();
    } catch { recoveryFeedback.textContent = strings.accountRecovery.error; }
}

async function loadCreationLinks() {
    links.innerHTML = `<p class="working-hours-feedback">${strings.creationLinks.loading}</p>`;
    try {
        const snapshot = await getDocs(query(collection(getFirestoreDb(), "creationLinks"), limit(50)));
        const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));
        links.innerHTML = items.length ? items.map(renderCreationLink).join("") : `<p class="working-hours-feedback">${strings.creationLinks.empty}</p>`;
    } catch { links.innerHTML = `<p class="working-hours-feedback">${strings.creationLinks.error}</p>`; }
}

function renderCreationLink(link) {
    const expiresAt = link.expiresAt?.toDate ? link.expiresAt.toDate() : new Date(link.expiresAt || 0);
    const canRevoke = link.status === "active";
    return `<article class="admin-request-row"><div class="admin-request-copy"><strong>${escapeHtml(link.email || "")}</strong><small>${escapeHtml(strings.creationLinks.status)}: ${escapeHtml(link.status || "")} · ${link.remainingUses || 0}/${link.maxUses || 0} · ${escapeHtml(expiresAt.toLocaleDateString("fr-FR"))}</small></div>${canRevoke ? `<button class="btn btn-ghost" type="button" data-revoke-link="${escapeHtml(link.id)}">${strings.creationLinks.revoke}</button>` : ""}</article>`;
}

async function createCreationLink(event) {
    event.preventDefault();
    const data = new FormData(linkForm);
    linkFeedback.textContent = strings.commandCenter.loading;
    try {
        const result = await httpsCallable(getFirebaseFunctions(), "createProfessionalCreationLink")({ email: data.get("email"), maxUses: Number(data.get("maxUses")), expiresInDays: Number(data.get("expiresInDays")) });
        linkFeedback.textContent = `${strings.creationLinks.generated} ${result.data.url}`;
        linkForm.reset();
        await loadCreationLinks();
    } catch { linkFeedback.textContent = strings.creationLinks.error; }
}

links.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-revoke-link]");
    if (!button || !window.confirm(strings.creationLinks.revokeConfirm)) return;
    try {
        await httpsCallable(getFirebaseFunctions(), "revokeProfessionalCreationLink")({ linkId: button.dataset.revokeLink });
        linkFeedback.textContent = strings.creationLinks.revoked;
        await loadCreationLinks();
    } catch { linkFeedback.textContent = strings.creationLinks.error; }
});

async function loadSummary() {
    summary.innerHTML = `<p class="working-hours-feedback">${strings.commandCenter.loading}</p>`;
    try {
        const [applications, ticketsSnapshot, dataRequestsSnapshot, linksSnapshot] = await Promise.all([
            getDocs(query(collection(getFirestoreDb(), "professionalRequests"))),
            getDocs(query(collection(getFirestoreDb(), "supportTickets"), limit(50))),
            getDocs(query(collection(getFirestoreDb(), "dataRequests"), limit(50))),
            getDocs(query(collection(getFirestoreDb(), "creationLinks"), limit(50)))
        ]);
        const openApplications = applications.docs.filter((item) => ["awaiting-email-verification", "pending-review", "approved-awaiting-password"].includes(item.data().status)).length;
        const openTickets = ticketsSnapshot.docs.filter((item) => item.data().status !== "completed").length;
        const openDataRequests = dataRequestsSnapshot.docs.filter((item) => item.data().status !== "completed").length;
        const now = Date.now();
        const soon = now + 7 * 24 * 60 * 60 * 1000;
        const expiringLinks = linksSnapshot.docs.filter((item) => {
            const data = item.data();
            const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt || 0);
            return data.status !== "revoked" && expiresAt.getTime() >= now && expiresAt.getTime() <= soon;
        }).length;
        const cards = [
            [strings.commandCenter.applications, openApplications],
            [strings.commandCenter.tickets, openTickets],
            [strings.commandCenter.dataRequests, openDataRequests],
            [strings.commandCenter.expiringLinks, expiringLinks]
        ];
        summary.innerHTML = cards.map(([label, count]) => `<article class="admin-summary-card"><strong>${count}</strong><span>${escapeHtml(label)}</span></article>`).join("");
    } catch {
        summary.innerHTML = `<p class="working-hours-feedback">${strings.commandCenter.error}</p>`;
    }
}

async function loadClaimConflicts() {
    claimConflicts.innerHTML = `<p class="working-hours-feedback">${strings.claimConflictsLoading}</p>`;
    try {
        const response = await httpsCallable(getFirebaseFunctions(), "listBookingClaimConflicts")();
        const items = response.data.conflicts || [];
        claimConflicts.innerHTML = items.length ? items.map(renderClaimConflict).join("") : `<p class="working-hours-feedback">${strings.claimConflictsEmpty}</p>`;
    } catch {
        claimConflicts.innerHTML = `<p class="working-hours-feedback">${strings.claimConflictsError}</p>`;
    }
}

function renderClaimConflict(conflict) {
    const reason = strings.claimConflictReasons[conflict.reasonCode] || strings.claimConflictReasons["identity-conflict"];
    return `<article class="admin-request-row" data-claim-conflict><div class="admin-request-copy"><strong>${escapeHtml(conflict.professionalName)}</strong><small>${escapeHtml(reason)}</small><span class="admin-request-status">${escapeHtml(conflict.bookingId)}</span></div><div class="working-hours-actions"><button class="btn btn-solid" type="button" data-claim-conflict-action="approve" data-booking-id="${escapeHtml(conflict.bookingId)}" data-contact-id="${escapeHtml(conflict.contactId)}">${strings.approveClaimConflict}</button><button class="btn btn-ghost" type="button" data-claim-conflict-action="deny" data-booking-id="${escapeHtml(conflict.bookingId)}" data-contact-id="${escapeHtml(conflict.contactId)}">${strings.denyClaimConflict}</button></div></article>`;
}

claimConflicts.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-claim-conflict-action]");
    if (!button) return;
    const approve = button.dataset.claimConflictAction === "approve";
    if (!window.confirm(approve ? strings.approveClaimConflictConfirm : strings.denyClaimConflictConfirm)) return;
    try {
        await httpsCallable(getFirebaseFunctions(), "resolveBookingClaimConflict")({ bookingId: button.dataset.bookingId, contactId: button.dataset.contactId, approve, requestId: createRequestId() });
        await loadClaimConflicts();
    } catch {
        status.textContent = strings.claimConflictUpdateError;
    }
});

function renderNavbar(user) {
    document.querySelector("[data-admin-navbar]").innerHTML = `<div class="pro-brand"><div class="pro-brand-mark" aria-hidden="true">JR</div><div class="pro-brand-text"><span>JR Booking Premium</span><small>${strings.brandSmall}</small></div></div><div class="pro-actions"><span class="pro-account-email">${escapeHtml(user.email || strings.adminAccount)}</span><button class="btn btn-solid" type="button" data-admin-logout>${strings.logout}</button></div>`;
    document.querySelector("[data-admin-logout]").addEventListener("click", async () => { await signOutCurrentUser(); window.location.assign("login.html"); });
}

async function loadQueues() {
    await loadQueue("supportTickets", tickets);
    await loadQueue("dataRequests", dataRequests);
}

async function loadQueue(collectionName, container) {
    try {
        const snapshot = await getDocs(query(collection(getFirestoreDb(), collectionName), limit(30)));
        const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        container.innerHTML = items.length ? items.map((item) => renderQueueItem(collectionName, item)).join("") : `<p class="working-hours-feedback">${strings.queueEmpty}</p>`;
        container.querySelectorAll("[data-queue-status]").forEach((button) => button.addEventListener("click", () => updateQueueStatus(collectionName, button.dataset.queueId, button.dataset.queueStatus)));
    } catch {
        container.innerHTML = `<p class="working-hours-feedback">${strings.queueError}</p>`;
    }
}

function renderQueueItem(collectionName, item) {
    return `<article class="admin-queue-row"><strong>${escapeHtml(item.subject || item.type || strings.untitled)}</strong><small>${escapeHtml(item.createdBy || "")} · ${escapeHtml(item.status || "pending")}</small><select data-queue-status data-queue-id="${escapeHtml(item.id)}"><option value="pending" ${item.status === "pending" ? "selected" : ""}>Pending</option><option value="in-progress" ${item.status === "in-progress" ? "selected" : ""}>In progress</option><option value="completed" ${item.status === "completed" ? "selected" : ""}>Completed</option></select></article>`;
}

async function updateQueueStatus(collectionName, id, nextStatus) {
    try {
        await updateDoc(doc(getFirestoreDb(), collectionName, id), { status: nextStatus, updatedAt: new Date().toISOString() });
        await loadQueues();
    } catch {
        status.textContent = strings.queueUpdateError;
    }
}

async function loadAuditLogs() {
    audit.innerHTML = `<p class="working-hours-feedback">${strings.auditLoading}</p>`;
    try {
        const snapshot = await getDocs(query(collection(getFirestoreDb(), "logs"), orderBy("at", "desc"), limit(30)));
        const items = snapshot.docs.map((item) => item.data());
        audit.innerHTML = items.length ? `<div class="admin-audit-list">${items.map(renderAuditLog).join("")}</div>` : `<p class="working-hours-feedback">${strings.auditEmpty}</p>`;
    } catch {
        audit.innerHTML = `<p class="working-hours-feedback">${strings.auditError}</p>`;
    }
}

function renderAuditLog(log) {
    return `<article class="admin-audit-row"><strong>${escapeHtml(log.action || "")}</strong><span>${escapeHtml(log.collectionId || "")} / ${escapeHtml(log.documentId || "")}</span><small>${escapeHtml(formatAuditDate(log.at))}</small></article>`;
}

function formatAuditDate(value) {
    const date = value?.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

async function loadRequests(user = authorizedAdmin) {
    status.textContent = strings.loading;
    requests.innerHTML = `<p class="working-hours-feedback">${strings.loading}</p>`;
    try {
        const snapshot = await getDocs(query(collection(getFirestoreDb(), "professionalRequests")));
        const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        requests.innerHTML = items.length ? items.sort((left, right) => String(left.status).localeCompare(String(right.status))).map(renderRequest).join("") : `<p class="working-hours-feedback">${strings.empty}</p>`;
        requests.querySelectorAll("[data-request-action]").forEach((button) => button.addEventListener("click", () => updateRequest(button.dataset.requestId, button.dataset.requestAction, user)));
        status.textContent = "";
    } catch (error) {
        status.textContent = getAuthErrorMessage(error);
        requests.innerHTML = `<p class="working-hours-feedback">${strings.loadError}</p>`;
    }
}

function renderRequest(request) {
    const file = request.verificationFile;
    const selection = request.status === "pending-review" ? `<label class="admin-request-select"><input type="checkbox" data-request-select value="${escapeHtml(request.id)}"><span class="visually-hidden">Sélectionner cette demande</span></label>` : "";
    const reviewActions = request.status === "pending-review" ? `<button class="btn btn-solid" type="button" data-request-action="approved" data-request-id="${escapeHtml(request.id)}">${strings.approve}</button><button class="btn btn-ghost" type="button" data-request-action="rejected" data-request-id="${escapeHtml(request.id)}">${strings.reject}</button>` : "";
    const banAction = request.status === "provisioned" ? `<button class="btn btn-ghost" type="button" data-ban-action="${request.accountStatus === "banned" ? "active" : "banned"}" data-request-id="${escapeHtml(request.id)}">${request.accountStatus === "banned" ? strings.reinstate : strings.ban}</button>` : "";
    return `<article class="admin-request-row">${selection}<div class="admin-request-copy"><strong>${escapeHtml(request.displayName || strings.unnamed)}</strong><small>${escapeHtml(request.email || "")} · ${escapeHtml(request.description || "")}</small><span class="admin-request-status">${escapeHtml(request.status || "")}${request.accountStatus ? ` · ${escapeHtml(request.accountStatus)}` : ""}</span><a href="${safeUrl(file?.url)}" target="_blank" rel="noreferrer">${escapeHtml(file?.name || strings.noFile)}</a></div><div class="working-hours-actions">${reviewActions}${banAction}</div></article>`;
}

async function updateRequest(requestId, nextStatus, user) {
    if (!window.confirm(nextStatus === "approved" ? strings.approveConfirm : strings.rejectConfirm)) return;
    try {
        await updateDoc(doc(getFirestoreDb(), "professionalRequests", requestId), { status: nextStatus, reviewedBy: user.uid, reviewedAt: new Date().toISOString() });
        if (nextStatus === "approved") await httpsCallable(getFirebaseFunctions(), "provisionProfessionalAccount")({ requestId });
        await loadRequests(user);
    } catch {
        status.textContent = strings.updateError;
    }
}

requests.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-ban-action]");
    if (!button) return;
    const banned = button.dataset.banAction === "banned";
    if (!window.confirm(banned ? strings.banConfirm : strings.reinstateConfirm)) return;
    try {
        await httpsCallable(getFirebaseFunctions(), "setAccountBanStatus")({ targetUid: button.dataset.requestId, banned });
        await updateDoc(doc(getFirestoreDb(), "professionalRequests", button.dataset.requestId), { accountStatus: banned ? "banned" : "active" });
        await loadRequests(authorizedAdmin);
    } catch {
        status.textContent = strings.banError;
    }
});

function safeUrl(value) {
    try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : "#"; } catch { return "#"; }
}

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[character])); }

function createRequestId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function bulkReview(decision, user) {
    const requestIds = [...requests.querySelectorAll("[data-request-select]:checked")].map((input) => input.value);
    if (!requestIds.length || !window.confirm(strings.bulkReview.confirmation)) return;
    try {
        await httpsCallable(getFirebaseFunctions(), "bulkReviewProfessionalApplications")({ requestIds, decision });
        status.textContent = strings.bulkReview.queued;
        await loadRequests(user);
    } catch { status.textContent = strings.bulkReview.error; }
}

async function purgeProfile() {
    const profileId = lifecycleForm.elements.profileId.value.trim();
    if (!profileId) { lifecycleFeedback.textContent = strings.lifecycle.purgeError; return; }
    const confirmation = window.prompt(strings.lifecycle.purgeConfirmation);
    if (confirmation !== strings.lifecycle.purgeConfirmation) return;
    try {
        await httpsCallable(getFirebaseFunctions(), "purgeProfessionalProfile")({ profileId, confirmation });
        lifecycleFeedback.textContent = strings.lifecycle.purged;
        lifecycleForm.reset();
    } catch { lifecycleFeedback.textContent = strings.lifecycle.purgeError; }
}