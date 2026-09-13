import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.clientDashboard.navbar;

export function initializeClientNavbar(container, { user, onLogout, onEditProfile, onPayment, onHistoryShare }) {
    container.innerHTML = `
        <div class="pro-brand">
            <div class="pro-brand-mark" aria-hidden="true">JR</div>
            <div class="pro-brand-text">
                <span>JR Booking Premium</span>
                <small>${UI_STRINGS.clientDashboard.brandSmall}</small>
            </div>
        </div>
        <div class="pro-actions">
            <div class="pro-account">
                <span class="eyebrow">Compte</span>
                <span class="pro-account-email"></span>
            </div>
            <button class="btn btn-ghost" type="button" data-print>${strings.print}</button>
            <div class="settings-menu" data-settings-menu>
                <button class="btn btn-ghost" type="button" aria-expanded="false" aria-haspopup="true" data-settings-trigger>${strings.settings}</button>
                <div class="glass settings-menu-items" role="menu" aria-label="${strings.settingsLabel}">
                    <button type="button" role="menuitem" data-menu-edit-profile>${strings.editProfile}</button>
                    <button type="button" role="menuitem" data-menu-payments title="${strings.paymentsUnavailable}">${strings.payments}</button>
                    <button type="button" role="menuitem" data-menu-history-share>${strings.historyShare}</button>
                </div>
            </div>
            <button class="btn btn-solid" type="button" data-logout>${strings.logout}</button>
        </div>
    `;

    container.querySelector(".pro-account-email").textContent = user.email || user.displayName || "Compte client";

    const settingsMenu = container.querySelector("[data-settings-menu]");
    const settingsTrigger = container.querySelector("[data-settings-trigger]");

    settingsTrigger.addEventListener("click", () => {
        const isOpen = settingsMenu.classList.toggle("is-open");
        settingsTrigger.setAttribute("aria-expanded", String(isOpen));
    });

    container.querySelector("[data-logout]").addEventListener("click", onLogout);
    container.querySelector("[data-menu-edit-profile]").addEventListener("click", () => {
        settingsMenu.classList.remove("is-open");
        settingsTrigger.setAttribute("aria-expanded", "false");
        onEditProfile?.();
    });
    container.querySelector("[data-menu-payments]").addEventListener("click", () => {
        settingsMenu.classList.remove("is-open");
        settingsTrigger.setAttribute("aria-expanded", "false");
        onPayment?.();
    });
    container.querySelector("[data-menu-history-share]").addEventListener("click", () => {
        settingsMenu.classList.remove("is-open");
        settingsTrigger.setAttribute("aria-expanded", "false");
        onHistoryShare?.();
    });
}
