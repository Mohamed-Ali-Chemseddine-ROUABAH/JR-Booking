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
            <button class="icon-button navbar-icon-action" type="button" data-print aria-label="${strings.print}" title="${strings.print}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5h-2M6 14h12v7H6z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"/></svg></button>
            <div class="settings-menu" data-settings-menu>
                <button class="icon-button navbar-icon-action" type="button" aria-expanded="false" aria-haspopup="true" data-settings-trigger aria-label="${strings.settings}" title="${strings.settings}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.1 3.5a7.9 7.9 0 0 0-.1-1l2-1.5-2-3.4-2.3.9a8.2 8.2 0 0 0-1.7-1L15.7 3h-4l-.3 3a8.2 8.2 0 0 0-1.7 1l-2.3-.9-2 3.4 2 1.5 2-1.5a7.9 7.9 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9a8.2 8.2 0 0 0 1.7 1l.3 3h4l.3-3a8.2 8.2 0 0 0 1.7-1l2.3.9 2-3.4-2-1.5a7.9 7.9 0 0 0 .1-1Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35"/></svg></button>
                <div class="glass settings-menu-items" role="menu" aria-label="${strings.settingsLabel}">
                    <button type="button" role="menuitem" data-menu-edit-profile>${strings.editProfile}</button>
                    <button type="button" role="menuitem" data-menu-payments title="${strings.paymentsUnavailable}">${strings.payments}</button>
                    <button type="button" role="menuitem" data-menu-history-share>${strings.historyShare}</button>
                </div>
            </div>
            <button class="icon-button navbar-icon-action navbar-logout-action" type="button" data-logout aria-label="${strings.logout}" title="${strings.logout}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 16l4-4-4-4m4 4H8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"/></svg></button>
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
