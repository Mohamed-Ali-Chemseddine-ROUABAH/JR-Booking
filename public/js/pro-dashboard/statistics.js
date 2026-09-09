import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { openPrintDocument } from "../shared/print-reports.js?v=print-report-20260909";

const strings = UI_STRINGS.proDashboard.statistics;

export async function initializeStatistics({ user }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<section class="glass working-hours-dialog statistics-dialog" aria-labelledby="statistics-title"><div class="working-hours-header"><h2 id="statistics-title">${strings.title}</h2><button class="btn btn-ghost" type="button" data-statistics-close>${strings.close}</button></div><div class="working-hours-fields"><label class="working-hours-field"><span>${strings.from}</span><input data-statistics-from type="date"></label><label class="working-hours-field"><span>${strings.to}</span><input data-statistics-to type="date"></label><label class="working-hours-field"><span>${strings.status}</span><select data-statistics-status><option value="">${strings.allStatuses}</option><option value="pending">${strings.pending}</option><option value="accepted">${strings.accepted}</option><option value="done">${strings.done}</option><option value="rejected">${strings.rejected}</option><option value="no-show">${strings.noShow}</option></select></label></div><div data-statistics-content><p class="working-hours-feedback">${strings.loading}</p></div></section>`;
    document.body.append(modal);
    modal.querySelector("[data-statistics-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
    try {
        const snapshot = await getDocs(query(collection(getFirestoreDb(), "bookings"), where("proId", "==", user.uid)));
        const bookings = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        const refresh = () => renderStatistics(modal.querySelector("[data-statistics-content]"), bookings, modal);
        modal.querySelectorAll("[data-statistics-from], [data-statistics-to], [data-statistics-status]").forEach((input) => input.addEventListener("change", refresh));
        refresh();
    } catch {
        modal.querySelector("[data-statistics-content]").innerHTML = `<p class="working-hours-feedback">${strings.loadError}</p>`;
    }
}

function renderStatistics(container, bookings, modal) {
    const from = modal.querySelector("[data-statistics-from]").value;
    const to = modal.querySelector("[data-statistics-to]").value;
    const status = modal.querySelector("[data-statistics-status]").value;
    const filtered = bookings.filter((booking) => {
        const date = toDate(booking.start);
        const day = date ? date.toISOString().slice(0, 10) : "";
        return (!from || day >= from) && (!to || day <= to) && (!status || booking.status === status);
    });
    const done = filtered.filter((booking) => booking.status === "done");
    const pending = filtered.filter((booking) => booking.status === "pending" || booking.status === "accepted");
    const noShows = filtered.filter((booking) => booking.status === "no-show");
    const rejected = filtered.filter((booking) => booking.status === "rejected");
    const totalRevenue = sumBalances(done);
    const pendingRevenue = sumBalances(pending);
    const completedRate = filtered.length ? Math.round(done.length / filtered.length * 100) : 0;
    const noShowRate = filtered.length ? Math.round(noShows.length / filtered.length * 100) : 0;
    const statusCounts = [
        [strings.pending, filtered.filter((booking) => booking.status === "pending").length],
        [strings.accepted, filtered.filter((booking) => booking.status === "accepted").length],
        [strings.done, done.length],
        [strings.rejected, rejected.length],
        [strings.noShow, noShows.length]
    ];
    const maxCount = Math.max(1, ...statusCounts.map((item) => item[1]));
    container.innerHTML = `<div class="statistics-grid"><article class="statistics-card"><small>${strings.totalBookings}</small><strong>${filtered.length}</strong></article><article class="statistics-card"><small>${strings.doneRevenue}</small><strong>${formatEuro(totalRevenue)}</strong></article><article class="statistics-card"><small>${strings.pendingRevenue}</small><strong>${formatEuro(pendingRevenue)}</strong></article><article class="statistics-card"><small>${strings.completionRate}</small><strong>${completedRate} %</strong></article><article class="statistics-card"><small>${strings.noShowRate}</small><strong>${noShowRate} %</strong></article><article class="statistics-card"><small>${strings.rejectedBookings}</small><strong>${rejected.length}</strong></article></div><section class="statistics-chart"><div class="working-hours-header"><h3>${strings.statusBreakdown}</h3><button class="btn btn-ghost" type="button" data-statistics-export>${strings.exportReport}</button></div><div class="statistics-bars">${statusCounts.map(([label, count]) => `<div class="statistics-bar-row"><span>${label}</span><div class="statistics-bar-track"><span style="width:${Math.round(count / maxCount * 100)}%"></span></div><strong>${count}</strong></div>`).join("")}</div></section><p class="working-hours-feedback">${strings.calculationNote}</p>`;
    container.querySelector("[data-statistics-export]").addEventListener("click", () => exportActivityReport(filtered, { from, to, status }));
}

function exportActivityReport(bookings, filters) {
    const rows = bookings.map((booking) => `<tr><td>${formatDate(booking.start)}</td><td>${escapeReport(booking.status || "")}</td><td>${formatEuro(Number(booking.customPrice ?? booking.paymentContext?.balance ?? 0))}</td></tr>`).join("");
    const report = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escapeReport(strings.reportTitle)}</title><style>body{font-family:Arial,sans-serif;color:#111;max-width:800px;margin:40px auto}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #ccc;text-align:left}</style></head><body><h1>${escapeReport(strings.reportTitle)}</h1><p>${escapeReport(filters.from || strings.noStart)} - ${escapeReport(filters.to || strings.noEnd)}</p><table><thead><tr><th>${escapeReport(strings.reportDate)}</th><th>${escapeReport(strings.status)}</th><th>${escapeReport(strings.reportAmount)}</th></tr></thead><tbody>${rows || `<tr><td colspan="3">${escapeReport(strings.noData)}</td></tr>`}</tbody></table></body></html>`;
    openPrintDocument(report);
}

function formatDate(value) {
    const date = toDate(value);
    return date ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(date) : "";
}

function escapeReport(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[character]));
}

function sumBalances(bookings) {
    return bookings.reduce((total, booking) => total + Number(booking.customPrice ?? booking.paymentContext?.balance ?? 0), 0);
}

function formatEuro(value) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

function toDate(value) {
    if (!value) return null;
    const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}