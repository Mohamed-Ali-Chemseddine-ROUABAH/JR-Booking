import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.navbar;

export function initializeProNavbar(container, { user, onLogout, onWorkingHours, onPaymentInfo, onMovementInfo, onPersonalInfo }) {
    container.innerHTML = `
        <div class="pro-brand">
            <div class="pro-brand-mark" aria-hidden="true">JR</div>
            <div class="pro-brand-text">
                <span>JR Booking Premium</span>
                <small>${UI_STRINGS.proDashboard.brandSmall}</small>
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
                    ${strings.settingsItems.map((item) => `<button type="button" role="menuitem">${item}</button>`).join("")}
                </div>
            </div>
            <button class="btn btn-solid" type="button" data-logout>${strings.logout}</button>
        </div>
    `;

    container.querySelector(".pro-account-email").textContent = user.email || user.displayName || "Compte professionnel";

    const settingsMenu = container.querySelector("[data-settings-menu]");
    const settingsTrigger = container.querySelector("[data-settings-trigger]");

    settingsTrigger.addEventListener("click", () => {
        const isOpen = settingsMenu.classList.toggle("is-open");
        settingsTrigger.setAttribute("aria-expanded", String(isOpen));
    });

    container.querySelector("[data-logout]").addEventListener("click", onLogout);
    // Settings item order matches UI_STRINGS.proDashboard.navbar.settingsItems: index 0 is working hours, index 4 is personal info.
    container.querySelectorAll("[role='menuitem']").forEach((item, index) => {
        item.addEventListener("click", () => {
            settingsMenu.classList.remove("is-open");
            settingsTrigger.setAttribute("aria-expanded", "false");
            if (index === 0) {
                onWorkingHours?.();
            } else if (index === 1) {
                onPaymentInfo?.();
            } else if (index === 2) {
                onMovementInfo?.();
            } else if (index === 4) {
                onPersonalInfo?.();
            }
        });
    });
}