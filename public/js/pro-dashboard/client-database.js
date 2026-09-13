import { collection, doc, getDocs, getDoc, query, serverTimestamp, setDoc, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { escapeHtml } from "../core/utils.js";
import { openPrintDocument } from "../shared/print-reports.js?v=print-report-20260909";

const strings = UI_STRINGS.proDashboard.clientDatabase;
const eraseConfirmationPhrase = "SUPPRIMER CE CLIENT";
const eraseGraceDays = 30;

export async function initializeClientDatabase({ user }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<section class="glass working-hours-dialog client-database-dialog" aria-labelledby="client-database-title"><div class="working-hours-header"><h2 id="client-database-title">${strings.title}</h2><button class="btn btn-ghost" type="button" data-client-database-close>${strings.close}</button></div><label class="working-hours-field"><span>${strings.filterLabel}</span><input type="search" data-client-filter placeholder="${strings.filterPlaceholder}"></label><div data-client-list><p class="working-hours-feedback">${strings.loading}</p></div></section>`;
    document.body.append(modal);
    const list = modal.querySelector("[data-client-list]");
    try {
        const snapshot = await getDocs(query(collection(getFirestoreDb(), "bookings"), where("proId", "==", user.uid)));
        const clients = groupClients(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        renderClients(list, clients, modal, user);
        modal.querySelector("[data-client-filter]").addEventListener("input", (event) => renderClients(list, clients, modal, user, event.target.value));
    } catch {
        list.innerHTML = `<p class="working-hours-feedback">${strings.loadError}</p>`;
    }
    modal.querySelector("[data-client-database-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
}

function groupClients(bookings) {
    const clients = new Map();
    bookings.filter((booking) => booking.clientId).forEach((booking) => {
        const client = clients.get(booking.clientId) || { id: booking.clientId, name: booking.clientName || booking.clientEmail || booking.clientId, email: booking.clientEmail || "", bookings: 0, bookingItems: [] };
        client.bookings += 1;
        client.bookingItems.push(booking);
        clients.set(booking.clientId, client);
    });
    return [...clients.values()].sort((left, right) => left.name.localeCompare(right.name, "fr"));
}

function renderClients(container, clients, modal, user, filter = "") {
    const normalizedFilter = filter.trim().toLocaleLowerCase("fr");
    const filtered = clients.filter((client) => `${client.name} ${client.email}`.toLocaleLowerCase("fr").includes(normalizedFilter));
    if (!filtered.length) {
        container.innerHTML = `<p class="working-hours-feedback">${strings.empty}</p>`;
        return;
    }
    container.innerHTML = filtered.map((client, index) => `<article class="client-database-row"><div><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.email || strings.noEmail)} · ${client.bookings} ${strings.bookings}</small></div><button class="btn btn-ghost" type="button" data-client-index="${index}">${strings.open}</button></article>`).join("");
    container.querySelectorAll("[data-client-index]").forEach((button) => button.addEventListener("click", () => openClientEditor(modal, user, filtered[Number(button.dataset.clientIndex)])));
}

async function openClientEditor(modal, user, client) {
    const recordRef = doc(getFirestoreDb(), "proClientRecords", `${user.uid}_${client.id}`);
    let record = {};
    try {
        const snapshot = await getDoc(recordRef);
        record = snapshot.data() || {};
    } catch {
        record = {};
    }
    const history = buildHistory(client.bookingItems);
    const editor = document.createElement("div");
    editor.className = "working-hours-section client-database-editor";
    const isBlocked = record.relationshipStatus === "blocked";
    const erasePending = record.eraseRequest?.status === "pending";
    editor.innerHTML = `<h3>${escapeHtml(client.name)}</h3><label class="working-hours-field"><span>${strings.rateLabel}</span><input data-client-rate type="number" min="0" step="0.01" value="${escapeAttribute(record.customRate ?? "")}"></label><label class="working-hours-field"><span>${strings.zoneLabel}</span><input data-client-zone type="number" min="0" step="0.01" value="${escapeAttribute(record.movementSurcharge ?? "")}"></label><div class="working-hours-actions"><button class="btn btn-solid" type="button" data-client-save>${strings.save}</button><button class="btn btn-ghost" type="button" data-client-block>${isBlocked ? strings.unblock : strings.block}</button><button class="btn btn-ghost" type="button" data-client-ban>${strings.requestBan}</button><button class="btn btn-ghost" type="button" data-client-export>${strings.exportPdf}</button></div><section class="client-history"><h4>${strings.historyTitle}</h4><div class="working-hours-fields"><label class="working-hours-field"><span>${strings.historyTypeLabel}</span><select data-history-type><option value="">${strings.historyAll}</option><option value="booking">${strings.historyBooking}</option><option value="status">${strings.historyStatus}</option></select></label><label class="working-hours-field"><span>${strings.historyDateLabel}</span><input data-history-date type="date"></label></div><div data-history-list>${renderHistory(history)}</div></section><div class="client-database-danger"><strong>${strings.eraseTitle}</strong><p>${erasePending ? strings.erasePending(record.eraseRequest.scheduledFor) : strings.eraseHelp}</p>${erasePending ? `<button class="btn btn-ghost" type="button" data-client-erase-cancel>${strings.cancelErase}</button>` : `<label class="working-hours-field"><span>${strings.erasePhraseLabel}</span><input data-client-erase-phrase type="text" autocomplete="off"></label><button class="btn btn-ghost" type="button" data-client-erase>${strings.erase}</button>`}<span class="working-hours-feedback" data-erase-feedback role="alert"></span></div><span class="working-hours-feedback" data-client-feedback role="status"></span>`;
    modal.querySelector("[data-client-list]").replaceChildren(editor);
    const refreshHistory = () => {
        const type = editor.querySelector("[data-history-type]").value;
        const date = editor.querySelector("[data-history-date]").value;
        editor.querySelector("[data-history-list]").innerHTML = renderHistory(history.filter((item) => (!type || item.type === type) && (!date || item.date.toISOString().slice(0, 10) === date)));
    };
    editor.querySelector("[data-history-type]").addEventListener("change", refreshHistory);
    editor.querySelector("[data-history-date]").addEventListener("change", refreshHistory);
    editor.querySelector("[data-client-export]").addEventListener("click", () => exportClientReport(client, history));
    editor.querySelector("[data-client-save]").addEventListener("click", async () => {
        const feedback = editor.querySelector("[data-client-feedback]");
        try {
            await setDoc(recordRef, { proId: user.uid, clientId: client.id, customRate: editor.querySelector("[data-client-rate]").value, movementSurcharge: editor.querySelector("[data-client-zone]").value }, { merge: true });
            feedback.textContent = strings.saved;
        } catch {
            feedback.textContent = strings.saveError;
        }
    });
    editor.querySelector("[data-client-block]").addEventListener("click", async () => {
        const nextStatus = isBlocked ? "active" : "blocked";
        if (!window.confirm(isBlocked ? strings.unblockConfirmation : strings.blockConfirmation)) return;
        await saveRecord(recordRef, { relationshipStatus: nextStatus, relationshipUpdatedAt: serverTimestamp() }, editor.querySelector("[data-client-feedback]"));
    });
    editor.querySelector("[data-client-ban]").addEventListener("click", async () => {
        if (!window.confirm(strings.banConfirmation)) return;
        await saveRecord(recordRef, { platformBanRequest: { status: "pending", requestedBy: user.uid, requestedAt: serverTimestamp() } }, editor.querySelector("[data-client-feedback]"));
    });
    editor.querySelector("[data-client-erase]")?.addEventListener("click", async () => {
        const feedback = editor.querySelector("[data-erase-feedback]");
        const phrase = editor.querySelector("[data-client-erase-phrase]").value.trim();
        if (phrase !== eraseConfirmationPhrase) {
            feedback.textContent = strings.eraseInvalid;
            return;
        }
        const scheduledFor = new Date(Date.now() + eraseGraceDays * 24 * 60 * 60 * 1000).toISOString();
        const saved = await saveRecord(recordRef, { eraseRequest: { status: "pending", requestedBy: user.uid, requestedAt: serverTimestamp(), scheduledFor } }, feedback);
        if (saved) feedback.textContent = strings.eraseScheduled(scheduledFor);
    });
    editor.querySelector("[data-client-erase-cancel]")?.addEventListener("click", async () => {
        await saveRecord(recordRef, { eraseRequest: { status: "cancelled", cancelledBy: user.uid, cancelledAt: serverTimestamp() } }, editor.querySelector("[data-erase-feedback]"));
    });
}

async function saveRecord(recordRef, values, feedback) {
    try {
        await setDoc(recordRef, values, { merge: true });
        feedback.textContent = strings.saved;
        return true;
    } catch {
        feedback.textContent = strings.saveError;
        return false;
    }
}

function escapeAttribute(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildHistory(bookings) {
    return bookings.flatMap((booking) => {
        const date = toDate(booking.updatedAt || booking.createdAt || booking.start) || new Date(0);
        const statusItems = Array.isArray(booking.statusHistory) ? booking.statusHistory.map((item) => ({ type: "status", date: toDate(item.at) || date, label: `${strings.historyStatus}: ${item.status}` })) : [{ type: "status", date, label: `${strings.historyStatus}: ${booking.status || ""}` }];
        return [{ type: "booking", date: toDate(booking.createdAt || booking.start) || date, label: `${strings.historyBooking}: ${formatHistoryDate(booking.start)}` }, ...statusItems];
    }).sort((left, right) => right.date - left.date).slice(0, 15);
}

function renderHistory(history) {
    return history.length ? `<ul class="client-history-list">${history.map((item) => `<li><span>${escapeHtml(item.label)}</span><small>${escapeHtml(formatHistoryDate(item.date))}</small></li>`).join("")}</ul>` : `<p class="working-hours-feedback">${strings.historyEmpty}</p>`;
}

function toDate(value) {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatHistoryDate(value) {
    const date = toDate(value);
    return date ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(date) : "";
}

function exportClientReport(client, history) {
    const report = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(strings.exportTitle)} - ${escapeHtml(client.name)}</title><style>body{font-family:Arial,sans-serif;color:#111;max-width:760px;margin:40px auto}h1{font-size:22px}li{margin:8px 0}small{color:#555}</style></head><body><h1>${escapeHtml(strings.exportTitle)}</h1><p><strong>${escapeHtml(client.name)}</strong><br>${escapeHtml(client.email || strings.noEmail)}</p><h2>${escapeHtml(strings.historyTitle)}</h2>${renderHistory(history)}</body></html>`;
    openPrintDocument(report);
}