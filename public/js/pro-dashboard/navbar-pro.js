import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.navbar;

export function initializeProNavbar(container, { user, profiles = [], activeProfileId, onProfileChange, onLogout, onPrint, onWorkingHours, onPaymentInfo, onMovementInfo, onServices, onIntake, onPersonalInfo, onClientDatabase, onStatistics }) {
    const profileSelector = profiles.length > 1 ? `<label class="pro-profile-selector"><span>${strings.profileLabel}</span><select data-profile-switcher>${profiles.map((profile) => `<option value="${escapeHtml(profile.id)}" ${profile.id === activeProfileId ? "selected" : ""}>${escapeHtml(profile.displayName || profile.name || profile.id)}</option>`).join("")}</select></label>` : "";
    container.innerHTML = `
        <div class="pro-brand">
            <div class="pro-brand-mark" aria-hidden="true">JR</div>
            <div class="pro-brand-text">
                <span>JR Booking Premium</span>
                <small>${UI_STRINGS.proDashboard.brandSmall}</small>
            </div>
        </div>
        <div class="pro-actions">
            ${profileSelector}
            <div class="pro-account">
                <span class="eyebrow">Compte</span>
                <span class="pro-account-email"></span>
            </div>
            <button class="btn btn-ghost" type="button" data-print>${strings.print}</button>
            <div class="settings-menu" data-settings-menu>
                <button class="btn btn-ghost" type="button" aria-expanded="false" aria-haspopup="true" data-settings-trigger>${strings.settings}</button>
                <div class="glass settings-menu-items" role="menu" aria-label="${strings.settingsLabel}">
                    ${strings.settingsItems.map((item, index) => `<button type="button" role="menuitem" data-settings-index="${index}">${item}</button>`).join("")}
                </div>
            </div>
            <button class="btn btn-solid" type="button" data-logout>${strings.logout}</button>
        </div>
    `;

    container.querySelector(".pro-account-email").textContent = user.email || user.displayName || "Compte professionnel";
    container.querySelector("[data-profile-switcher]")?.addEventListener("change", (event) => onProfileChange?.(event.target.value));
    container.querySelector("[data-print]").addEventListener("click", onPrint);

    const settingsMenu = container.querySelector("[data-settings-menu]");
    const settingsTrigger = container.querySelector("[data-settings-trigger]");

    settingsTrigger.addEventListener("click", () => {
        const isOpen = settingsMenu.classList.toggle("is-open");
        settingsTrigger.setAttribute("aria-expanded", String(isOpen));
    });

    container.querySelector("[data-logout]").addEventListener("click", onLogout);
    container.querySelectorAll("[role='menuitem']").forEach((item) => {
        item.addEventListener("click", () => {
            settingsMenu.classList.remove("is-open");
            settingsTrigger.setAttribute("aria-expanded", "false");
            const index = Number(item.dataset.settingsIndex);
            if (index === 0) {
                onWorkingHours?.();
            } else if (index === 1) {
                onPaymentInfo?.();
            } else if (index === 2) {
                onMovementInfo?.();
            } else if (index === 3) {
                onServices?.();
            } else if (index === 4) {
                onIntake?.();
            } else if (index === 5) {
                onPersonalInfo?.();
            } else if (index === 6) {
                onClientDatabase?.();
            } else if (index === 7) {
                onStatistics?.();
            }
        });
    });
}

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character])); }