import { UI_STRINGS } from "../core/strings-fr.js";
import { escapeHtml } from "../core/utils.js";

const strings = UI_STRINGS.clientDashboard.historyShare;

export function initializeHistoryShare({ userId, relationships = [], onApprove, onRevoke } = {}) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <section class="glass working-hours-dialog client-history-share-dialog" aria-labelledby="client-history-share-title">
            <div class="working-hours-header">
                <h2 id="client-history-share-title">${strings.title}</h2>
                <button class="btn btn-ghost" type="button" data-history-share-close>${strings.close}</button>
            </div>
            <p class="working-hours-feedback">${strings.intro}</p>
            <div data-history-share-content></div>
        </section>
    `;
    document.body.append(modal);
    render(modal.querySelector("[data-history-share-content]"), userId, relationships, onApprove, onRevoke);

    modal.querySelector("[data-history-share-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
    return modal;
}

function render(container, userId, relationships, onApprove, onRevoke) {
    const incoming = relationships.filter((item) => item.status === "pending" && item.recipientUid === userId);
    const outgoing = relationships.filter((item) => item.status === "pending" && item.requesterUid === userId);
    const active = relationships.filter((item) => item.status === "active");

    if (!incoming.length && !outgoing.length && !active.length) {
        container.innerHTML = `<p class="working-hours-feedback">${strings.empty}</p>`;
        return;
    }

    container.innerHTML = [
        renderSection(strings.incomingTitle, incoming, renderIncomingItem),
        renderSection(strings.outgoingTitle, outgoing, renderRevocableItem),
        renderSection(strings.activeTitle, active, renderRevocableItem)
    ].join("");

    container.querySelectorAll("[data-approve]").forEach((button) => {
        button.addEventListener("click", () => onApprove?.(relationships.find((item) => item.id === button.dataset.approve)));
    });
    container.querySelectorAll("[data-decline], [data-revoke]").forEach((button) => {
        const id = button.dataset.decline || button.dataset.revoke;
        button.addEventListener("click", () => {
            if (window.confirm(strings.revokeConfirmation)) onRevoke?.(relationships.find((item) => item.id === id));
        });
    });
}

function renderSection(title, items, renderItem) {
    if (!items.length) return "";
    return `<div class="client-history-share-section"><h3>${title}</h3><ul class="client-history-share-list">${items.map(renderItem).join("")}</ul></div>`;
}

function renderIncomingItem(item) {
    return `
        <li class="client-history-share-item" data-relationship="${item.id}">
            <div><strong>${escapeHtml(item.contextLabel || scopeLabel(item.scope))}</strong><span>${scopeLabel(item.scope)}</span></div>
            <div class="client-history-share-actions">
                <button class="btn btn-solid" type="button" data-approve="${item.id}">${strings.approve}</button>
                <button class="btn btn-ghost" type="button" data-decline="${item.id}">${strings.decline}</button>
            </div>
        </li>
    `;
}

function renderRevocableItem(item) {
    return `
        <li class="client-history-share-item" data-relationship="${item.id}">
            <div><strong>${escapeHtml(item.contextLabel || scopeLabel(item.scope))}</strong><span>${scopeLabel(item.scope)}</span></div>
            <div class="client-history-share-actions">
                <button class="btn btn-ghost" type="button" data-revoke="${item.id}">${strings.revoke}</button>
            </div>
        </li>
    `;
}

function scopeLabel(scope) {
    if (scope === "professional") return strings.scopeProfessional;
    if (scope === "all") return strings.scopeAll;
    return strings.scopeBooking;
}
