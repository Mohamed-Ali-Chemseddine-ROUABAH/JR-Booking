import { collection, getDocs, query, updateDoc, doc, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirebaseFunctions, getFirestoreDb } from "../core/firebase-init.js?v=admin-provisioning-20260909";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { getAuthErrorMessage, requireAuth, signOutCurrentUser } from "../core/auth-guard.js";
import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.admin;
const status = document.querySelector("[data-admin-status]");
const requests = document.querySelector("[data-admin-requests]");
const audit = document.querySelector("[data-admin-audit]");
const tickets = document.querySelector("[data-admin-tickets]");
const dataRequests = document.querySelector("[data-admin-data-requests]");
let authorizedAdmin;

requireAuth({ allowedRoles: ["admin"], onAuthorized: async ({ user }) => {
    authorizedAdmin = user;
    renderNavbar(user);
    document.querySelector("[data-admin-refresh]").addEventListener("click", () => loadRequests(user));
    document.querySelector("[data-admin-audit-refresh]").addEventListener("click", loadAuditLogs);
    document.querySelector("[data-admin-queues-refresh]").addEventListener("click", loadQueues);
    await loadRequests(user);
    await loadAuditLogs();
    await loadQueues();
} });

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
    const reviewActions = request.status === "pending-review" ? `<button class="btn btn-solid" type="button" data-request-action="approved" data-request-id="${escapeHtml(request.id)}">${strings.approve}</button><button class="btn btn-ghost" type="button" data-request-action="rejected" data-request-id="${escapeHtml(request.id)}">${strings.reject}</button>` : "";
    const banAction = request.status === "provisioned" ? `<button class="btn btn-ghost" type="button" data-ban-action="${request.accountStatus === "banned" ? "active" : "banned"}" data-request-id="${escapeHtml(request.id)}">${request.accountStatus === "banned" ? strings.reinstate : strings.ban}</button>` : "";
    return `<article class="admin-request-row"><div class="admin-request-copy"><strong>${escapeHtml(request.displayName || strings.unnamed)}</strong><small>${escapeHtml(request.email || "")} · ${escapeHtml(request.description || "")}</small><span class="admin-request-status">${escapeHtml(request.status || "")}${request.accountStatus ? ` · ${escapeHtml(request.accountStatus)}` : ""}</span><a href="${safeUrl(file?.url)}" target="_blank" rel="noreferrer">${escapeHtml(file?.name || strings.noFile)}</a></div><div class="working-hours-actions">${reviewActions}${banAction}</div></article>`;
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