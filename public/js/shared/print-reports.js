export function openPrintDocument(html) {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const reportWindow = window.open(url, "_blank");
    if (!reportWindow) {
        URL.revokeObjectURL(url);
        return false;
    }
    reportWindow.addEventListener("load", () => {
        reportWindow.focus();
        reportWindow.print();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    }, { once: true });
    return true;
}

export function buildProfessionalScheduleReport({ professionalName, bookings, strings, mode = "schedule", anonymizeClients = true }) {
    const includePrices = mode === "prices" || mode === "summary";
    const summaryOnly = mode === "summary";
    const reportBookings = mode === "monthly"
        ? bookings.filter((booking) => {
            const date = new Date(booking.start);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        })
        : bookings;
    const rows = reportBookings
        .slice()
        .sort((left, right) => new Date(left.start) - new Date(right.start))
        .map((booking) => `<tr><td>${escapeHtml(formatDate(booking.start))}</td><td>${escapeHtml(formatTime(booking.start))} - ${escapeHtml(formatTime(booking.end))}</td><td>${escapeHtml(mode === "schedule" && anonymizeClients ? strings.anonymous : booking.clientDisplayName || booking.clientEmail || booking.guestContact?.name || strings.guest)}</td><td><span class="status status-${escapeHtml(booking.status || "unknown")}">${escapeHtml(strings.statuses[booking.status] || booking.status || "")}</span></td>${includePrices ? `<td>${escapeHtml(formatEuro(resolveBookingPrice(booking)))}</td>` : ""}</tr>`)
        .join("");
    const columns = `<th>${escapeHtml(strings.date)}</th><th>${escapeHtml(strings.time)}</th><th>${escapeHtml(strings.client)}</th><th>${escapeHtml(strings.status)}</th>${includePrices ? `<th>${escapeHtml(strings.amount)}</th>` : ""}`;
    const body = summaryOnly ? "" : `<table><thead><tr>${columns}</tr></thead><tbody>${rows || `<tr><td colspan="${includePrices ? 5 : 4}">${escapeHtml(strings.empty)}</td></tr>`}</tbody></table>`;
    const revenue = calculateReportRevenue(reportBookings);
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(strings.title)}</title><style>${reportStyles()}</style></head><body><header><div class="eyebrow">JR BOOKING PREMIUM</div><h1>${escapeHtml(strings.title)}</h1><p>${escapeHtml(professionalName || strings.professional)} · ${escapeHtml(new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date()))}</p></header><section class="summary"><div><small>${escapeHtml(strings.total)}</small><strong>${reportBookings.length}</strong></div><div><small>${escapeHtml(strings.grossRevenue || strings.totalRevenue)}</small><strong>${escapeHtml(formatEuro(revenue.grossRevenue))}</strong></div><div><small>${escapeHtml(strings.doneRevenue || strings.totalRevenue)}</small><strong>${escapeHtml(formatEuro(revenue.realizedRevenue))}</strong></div><div><small>${escapeHtml(strings.pendingRevenue || strings.totalRevenue)}</small><strong>${escapeHtml(formatEuro(revenue.inProgressRevenue))}</strong></div></section>${body}</body></html>`;
}

export function calculateReportRevenue(bookings) {
    const realizedRevenue = sumResolvedPrices(bookings.filter((booking) => booking.status === "done"));
    const inProgressRevenue = sumResolvedPrices(bookings.filter((booking) => booking.status === "pending" || booking.status === "accepted"));
    return { realizedRevenue, inProgressRevenue, grossRevenue: realizedRevenue + inProgressRevenue };
}

function sumResolvedPrices(bookings) {
    return bookings.reduce((total, booking) => total + Number(booking.customPrice ?? booking.paymentContext?.balance ?? booking.service?.price ?? 0), 0);
}

function resolveBookingPrice(booking) {
    return Number(booking.customPrice ?? booking.paymentContext?.balance ?? booking.service?.price ?? 0);
}

function reportStyles() {
    return "@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#17202a;margin:0}header{border-bottom:3px solid #17202a;padding-bottom:18px;margin-bottom:24px}.eyebrow{font-size:11px;letter-spacing:.18em;color:#65717d}h1{font-size:28px;margin:12px 0 6px}p{color:#65717d}.summary{display:flex;gap:12px;margin-bottom:24px}.summary div{min-width:150px;padding:14px;border:1px solid #d8dee5;border-radius:8px}.summary small{display:block;color:#65717d}.summary strong{display:block;font-size:20px;margin-top:6px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:10px 8px;border-bottom:1px solid #d8dee5;text-align:left}th{background:#f1f4f7;font-size:11px;text-transform:uppercase;letter-spacing:.06em}.status{font-weight:700}.status-done,.status-accepted{color:#146c43}.status-rejected,.status-no-show{color:#b42318}.status-pending{color:#9a6700}";
}

function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(date);
}

function formatTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" }).format(date);
}

function formatEuro(value) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[character]));
}