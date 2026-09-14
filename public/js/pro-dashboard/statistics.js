import { collection, getDoc, getDocs, doc, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { openPrintDocument } from "../shared/print-reports.js?v=print-report-20260909";
import { calculateCategoryBreakdown, calculateReportingHighlights, calculateRevenueSummary, calculateStatisticsMetrics, calculateTrendData, filterCompletedActivityBookings, filterStatisticsBookings, getBookingActivityLabel } from "./statistics-metrics.mjs";

const strings = UI_STRINGS.proDashboard.statistics;

export async function initializeStatistics({ user }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<section class="glass working-hours-dialog statistics-dialog" aria-labelledby="statistics-title"><div class="working-hours-header"><h2 id="statistics-title">${strings.title}</h2><button class="btn btn-ghost" type="button" data-statistics-close>${strings.close}</button></div><div class="working-hours-fields"><label class="working-hours-field"><span>${strings.from}</span><input data-statistics-from type="date"></label><label class="working-hours-field"><span>${strings.to}</span><input data-statistics-to type="date"></label><label class="working-hours-field"><span>${strings.status}</span><select data-statistics-status><option value="">${strings.allStatuses}</option><option value="pending">${strings.pending}</option><option value="accepted">${strings.accepted}</option><option value="done">${strings.done}</option><option value="rejected">${strings.rejected}</option><option value="no-show">${strings.noShow}</option></select></label><label class="working-hours-field"><span>${strings.activity}</span><select data-statistics-activity><option value="">${strings.allActivities}</option></select></label></div><div data-statistics-content><p class="working-hours-feedback">${strings.loading}</p></div></section>`;
    document.body.append(modal);
    modal.querySelector("[data-statistics-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
    try {
        const [snapshot, profileSnapshot] = await Promise.all([
            getDocs(query(collection(getFirestoreDb(), "bookings"), where("proId", "==", user.uid))),
            getDoc(doc(getFirestoreDb(), "proProfiles", user.uid))
        ]);
        const bookings = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        const workingHours = profileSnapshot.data()?.workingHours || {};
        const activitySelect = modal.querySelector("[data-statistics-activity]");
        [...new Set(bookings.map(getBookingActivityLabel))].sort((left, right) => left.localeCompare(right, "fr")).forEach((activity) => activitySelect.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(activity)}">${escapeHtml(activity)}</option>`));
        const refresh = () => renderStatistics(modal.querySelector("[data-statistics-content]"), bookings, workingHours, modal);
        modal.querySelectorAll("[data-statistics-from], [data-statistics-to], [data-statistics-status], [data-statistics-activity]").forEach((input) => input.addEventListener("change", refresh));
        refresh();
    } catch {
        modal.querySelector("[data-statistics-content]").innerHTML = `<p class="working-hours-feedback">${strings.loadError}</p>`;
    }
}

function renderStatistics(container, bookings, workingHours, modal) {
    const from = modal.querySelector("[data-statistics-from]").value;
    const to = modal.querySelector("[data-statistics-to]").value;
    const status = modal.querySelector("[data-statistics-status]").value;
    const activity = modal.querySelector("[data-statistics-activity]").value;
    const filtered = filterStatisticsBookings(bookings, { activity }).filter((booking) => {
        const date = toDate(booking.start);
        const day = date ? date.toISOString().slice(0, 10) : "";
        return (!from || day >= from) && (!to || day <= to) && (!status || booking.status === status);
    });
    const done = filtered.filter((booking) => booking.status === "done");
    const pending = filtered.filter((booking) => booking.status === "pending" || booking.status === "accepted");
    const noShows = filtered.filter((booking) => booking.status === "no-show");
    const rejected = filtered.filter((booking) => booking.status === "rejected");
    const metrics = calculateStatisticsMetrics(filtered, workingHours, { from, to });
    const revenue = calculateRevenueSummary(filtered);
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
    const trendData = calculateTrendData(filtered, { from, to });
    const categoryData = calculateCategoryBreakdown(filtered, { from, to });
    const highlights = calculateReportingHighlights(trendData, categoryData);
    const completedActivityBookings = filterCompletedActivityBookings(filtered);
    const completedTrendData = calculateTrendData(completedActivityBookings, { from, to });
    const completedCategoryData = calculateCategoryBreakdown(completedActivityBookings, { from, to });
    const completedHighlights = calculateReportingHighlights(completedTrendData, completedCategoryData);
    const maxTrendRevenue = Math.max(1, ...trendData.map((item) => item.revenue));
    const maxCategoryCount = Math.max(1, ...categoryData.map((item) => item.count));
    container.innerHTML = `<div class="statistics-grid"><article class="statistics-card"><small>${metricLabel(strings.totalBookings, strings.filterHelp)}</small><strong>${filtered.length}</strong></article><article class="statistics-card"><small>${metricLabel(strings.grossRevenue, strings.calculationNote)}</small><strong>${formatEuro(revenue.grossRevenue)}</strong></article><article class="statistics-card"><small>${metricLabel(strings.doneRevenue, strings.calculationNote)}</small><strong>${formatEuro(revenue.realizedRevenue)}</strong></article><article class="statistics-card"><small>${metricLabel(strings.pendingRevenue, strings.calculationNote)}</small><strong>${formatEuro(revenue.inProgressRevenue)}</strong></article><article class="statistics-card"><small>${metricLabel(strings.completionRate, strings.filterHelp)}</small><strong>${completedRate} %</strong></article><article class="statistics-card"><small>${metricLabel(strings.noShowRate, strings.filterHelp)}</small><strong>${noShowRate} %</strong></article><article class="statistics-card"><small>${metricLabel(strings.rejectedBookings, strings.filterHelp)}</small><strong>${rejected.length}</strong></article><article class="statistics-card"><small>${metricLabel(strings.occupancy, strings.occupancyHelp)}</small><strong>${metrics.occupancyRate} %</strong><span>${formatHours(metrics.bookedMinutes)} / ${formatHours(metrics.availableMinutes)}</span></article><article class="statistics-card"><small>${metricLabel(strings.retention, strings.retentionHelp)}</small><strong>${metrics.retentionRate} %</strong><span>${metrics.repeatClients} / ${metrics.uniqueClients} ${strings.repeatClients}</span></article></div><section class="statistics-chart"><div class="working-hours-header"><h3>${strings.statusBreakdown} <span class="statistics-info" title="${strings.filterHelp}" aria-label="${strings.filterHelp}">i</span></h3><button class="btn btn-ghost" type="button" data-statistics-export>${strings.exportReport}</button></div><div class="statistics-bars">${statusCounts.map(([label, count]) => `<div class="statistics-bar-row"><span>${label}</span><div class="statistics-bar-track"><span style="width:${Math.round(count / maxCount * 100)}%"></span></div><strong>${count}</strong></div>`).join("")}</div></section><section class="statistics-chart"><div class="working-hours-header"><h3>${strings.revenueTrend} <span class="statistics-info" title="${strings.trendHelp}" aria-label="${strings.trendHelp}">i</span></h3></div><div class="statistics-bars">${trendData.map(({ date, bookings, revenue }) => `<div class="statistics-bar-row"><span>${formatShortDate(date)}</span><div class="statistics-bar-track"><span style="width:${Math.round(bookings / maxTrendCount * 100)}%"></span></div><strong>${bookings}</strong><small>${formatEuro(revenue)}</small></div>`).join("") || `<p class="working-hours-feedback">${strings.noData}</p>`}</div></section><section class="statistics-chart"><div class="working-hours-header"><h3>${strings.categoryBreakdown} <span class="statistics-info" title="${strings.categoryHelp}" aria-label="${strings.categoryHelp}">i</span></h3></div><div class="statistics-bars">${categoryData.map(({ label, count, revenue }) => `<div class="statistics-bar-row"><span>${escapeHtml(label)}</span><div class="statistics-bar-track"><span style="width:${Math.round(count / maxCategoryCount * 100)}%"></span></div><strong>${count}</strong><small>${formatEuro(revenue)}</small></div>`).join("") || `<p class="working-hours-feedback">${strings.noData}</p>`}</div></section><p class="working-hours-feedback">${strings.calculationNote}</p>`;
    container.querySelectorAll(".statistics-chart")[1]?.insertAdjacentHTML("afterbegin", renderTrendLineChart(trendData, maxTrendRevenue));
    container.querySelectorAll(".statistics-chart")[2]?.insertAdjacentHTML("afterbegin", renderCategoryShareChart(categoryData));
    container.querySelector("[data-statistics-export]").addEventListener("click", () => exportActivityReport(completedActivityBookings, { from, to, status, trendData: completedTrendData, categoryData: completedCategoryData, highlights: completedHighlights }));
    const peakDay = highlights.peakDay ? `${formatShortDate(highlights.peakDay.date)} · ${formatEuro(highlights.peakDay.revenue)}` : strings.noData;
    const leadingCategory = highlights.leadingCategory ? `${escapeHtml(highlights.leadingCategory.label)} · ${highlights.leadingCategoryShare} % ${strings.categoryShare}` : strings.noData;
    container.insertAdjacentHTML("afterbegin", `<section class="statistics-highlights" aria-label="${strings.title}"><article class="statistics-highlight"><small>${strings.peakRevenueDay}</small><strong>${peakDay}</strong></article><article class="statistics-highlight"><small>${strings.averageDailyRevenue}</small><strong>${formatEuro(highlights.averageDailyRevenue)}</strong></article><article class="statistics-highlight"><small>${strings.leadingCategory}</small><strong>${leadingCategory}</strong></article></section>`);
    container.querySelectorAll(".statistics-bars").forEach((bars) => {
        if (!bars.children.length) bars.innerHTML = `<p class="statistics-empty">${strings.noData}</p>`;
    });
}

function exportActivityReport(bookings, filters) {
    const rows = bookings.map((booking) => `<tr><td>${formatDate(booking.start)}</td><td>${escapeReport(booking.status || "")}</td><td>${formatEuro(resolveBookingPrice(booking))}</td></tr>`).join("");
    const highlights = filters.highlights || calculateReportingHighlights(filters.trendData || [], filters.categoryData || []);
    const summary = `<section><h2>${escapeReport(strings.reportSummary)}</h2><p>${escapeReport(strings.peakRevenueDay)}: ${highlights.peakDay ? `${escapeReport(formatShortDate(highlights.peakDay.date))} · ${escapeReport(formatEuro(highlights.peakDay.revenue))}` : escapeReport(strings.noData)}</p><p>${escapeReport(strings.averageDailyRevenue)}: ${escapeReport(formatEuro(highlights.averageDailyRevenue))}</p><p>${escapeReport(strings.leadingCategory)}: ${highlights.leadingCategory ? `${escapeReport(highlights.leadingCategory.label)} · ${highlights.leadingCategoryShare} % ${escapeReport(strings.categoryShare)}` : escapeReport(strings.noData)}</p></section>`;
    const report = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escapeReport(strings.reportTitle)}</title><style>body{font-family:Arial,sans-serif;color:#111;max-width:800px;margin:40px auto}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #ccc;text-align:left}section{margin:20px 0;padding:12px;background:#f3f3f3}section p{margin:6px 0}</style></head><body><h1>${escapeReport(strings.reportTitle)}</h1><p>${escapeReport(filters.from || strings.noStart)} - ${escapeReport(filters.to || strings.noEnd)}</p>${summary}<table><thead><tr><th>${escapeReport(strings.reportDate)}</th><th>${escapeReport(strings.status)}</th><th>${escapeReport(strings.reportAmount)}</th></tr></thead><tbody>${rows || `<tr><td colspan="3">${escapeReport(strings.noData)}</td></tr>`}</tbody></table></body></html>`;
    openPrintDocument(report);
}

function formatDate(value) {
    const date = toDate(value);
    return date ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(date) : "";
}

function formatShortDate(value) {
    const date = toDate(value);
    return date ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(date) : "";
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[character]));
}

function escapeReport(value) {
    return escapeHtml(value);
}

function formatEuro(value) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

function resolveBookingPrice(booking) {
    return Number(booking.customPrice ?? booking.paymentContext?.balance ?? booking.service?.price ?? 0);
}

function formatHours(minutes) {
    return `${Math.round(minutes / 60 * 10) / 10} h`;
}

function toDate(value) {
    if (!value) return null;
    const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function renderTrendLineChart(trendData, maxTrendRevenue) {
    if (!trendData.length) return "";
    const width = 640;
    const height = 150;
    const points = trendData.map((item, index) => `${trendData.length === 1 ? width / 2 : index / (trendData.length - 1) * width},${height - item.revenue / maxTrendRevenue * 110 - 20}`).join(" ");
    return `<div class="statistics-line-chart" role="img" aria-label="${strings.revenueTrend}"><svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3" vector-effect="non-scaling-stroke"></polyline></svg></div>`;
}

function renderCategoryShareChart(categoryData) {
    if (!categoryData.length) return "";
    const total = categoryData.reduce((sum, item) => sum + item.revenue, 0);
    const visibleCategories = categoryData.slice(0, 6);
    const chart = visibleCategories.map((item, index) => `<span class="statistics-share-segment" style="--share:${total ? Math.round(item.revenue / total * 100) : 0}%;--segment-index:${index}" title="${escapeHtml(item.label)}: ${total ? Math.round(item.revenue / total * 100) : 0} %"></span>`).join("");
    const legend = visibleCategories.map((item, index) => `<span class="statistics-share-legend-item"><i style="--segment-index:${index}" aria-hidden="true"></i>${escapeHtml(item.label)} <strong>${total ? Math.round(item.revenue / total * 100) : 0} %</strong></span>`).join("");
    return `<div class="statistics-share-chart" role="img" aria-label="${strings.categoryBreakdown}">${chart}</div><div class="statistics-share-legend" aria-label="${strings.categoryBreakdown}">${legend}</div>`;
}

function metricLabel(label, help) {
    return `${escapeHtml(label)} <span class="statistics-info" title="${escapeHtml(help)}" aria-label="${escapeHtml(help)}">i</span>`;
}