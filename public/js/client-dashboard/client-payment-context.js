import { UI_STRINGS } from "../core/strings-fr.js";
import { escapeHtml } from "../core/utils.js";
import { normalizeCustomPaymentLinks } from "../core/payment-links.js";

const strings = UI_STRINGS.clientDashboard.paymentContext;

export function initializeClientPaymentContext({ bookings = [] } = {}) {
    const activeBookings = bookings.filter((booking) => ["pending", "accepted"].includes(booking.status) && booking.paymentContext);
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <section class="glass working-hours-dialog client-payment-dialog" aria-labelledby="client-payment-title">
            <div class="working-hours-header">
                <h2 id="client-payment-title">${strings.title}</h2>
                <button class="btn btn-ghost" type="button" data-payment-close>${strings.close}</button>
            </div>
            <div class="client-payment-content" data-payment-content></div>
        </section>
    `;
    document.body.append(modal);
    const content = modal.querySelector("[data-payment-content]");

    if (!activeBookings.length) {
        content.innerHTML = `<p class="working-hours-feedback">${strings.noActiveBooking}</p>`;
    } else if (activeBookings.length > 1) {
        content.innerHTML = `<p class="working-hours-feedback">${strings.chooseBooking}</p><div class="client-payment-choices">${activeBookings.map((booking, index) => `<button class="btn btn-ghost" type="button" data-payment-choice="${index}">${escapeHtml(booking.proDisplayName || "Professionnel")} · ${formatBookingDate(booking.start)}</button>`).join("")}</div><div data-payment-detail></div>`;
        modal.querySelectorAll("[data-payment-choice]").forEach((button) => button.addEventListener("click", () => renderPaymentDetail(modal.querySelector("[data-payment-detail]"), activeBookings[Number(button.dataset.paymentChoice)])));
    } else {
        renderPaymentDetail(content, activeBookings[0]);
    }

    modal.querySelector("[data-payment-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
}

function renderPaymentDetail(container, booking) {
    const payment = booking.paymentContext;
    const options = [];
    if (payment.bankTransfer && payment.rib) options.push(`<div class="client-payment-option"><strong>${strings.bankTransfer}</strong><pre>${escapeHtml(payment.rib)}</pre></div>`);
    if (payment.wero && payment.weroPhone) options.push(`<div class="client-payment-option"><strong>${strings.wero}</strong><span>${escapeHtml(payment.weroPhone)}</span></div>`);
    normalizeCustomPaymentLinks(payment).filter((link) => link.url).forEach((link) => options.push(`<a class="btn btn-solid" href="${safeUrl(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label || strings.externalLink)}</a>`));
    if (payment.banks?.length) options.push(`<p class="client-payment-meta"><strong>${strings.acceptedBanks}:</strong> ${payment.banks.map(escapeHtml).join(" · ")}</p>`);
    container.innerHTML = `
        <div class="client-payment-summary"><span>${strings.reference}: ${escapeHtml(booking.proDisplayName || "Professionnel")}</span><strong>${strings.balance}: ${Number(payment.balance || 0).toFixed(2)} €</strong><small>${strings.duration}: ${payment.durationHours} ${strings.hours}</small></div>
        <div class="client-payment-options">${options.join("") || `<p class="working-hours-feedback">${strings.noOptions}</p>`}</div>
    `;
}

function formatBookingDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(date);
}

function safeUrl(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
    } catch {
        return "#";
    }
}