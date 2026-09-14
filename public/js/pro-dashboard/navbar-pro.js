import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.navbar;

export function initializeProNavbar(container, { user, profiles = [], activeProfileId, canManageSettings = true, onNotifications, onProfileChange, onLogout, onPrint, onWorkingHours, onPaymentInfo, onMovementInfo, onServices, onIntake, onQuickReplies, onDelegatedAccess, onDirectLinks, onPersonalInfo, onExportData, onClientDatabase, onStatistics, onNotificationPreferences }) {
    const profileSelector = profiles.length > 1 ? `<label class="pro-profile-selector"><span>${strings.profileLabel}</span><select data-profile-switcher>${profiles.map((profile) => `<option value="${escapeHtml(profile.id)}" ${profile.id === activeProfileId ? "selected" : ""}>${escapeHtml(profile.displayName || profile.name || profile.id)}</option>`).join("")}</select></label>` : "";
    container.innerHTML = `
        <div class="pro-brand">
            <div class="pro-brand-mark" aria-hidden="true">JR</div>
            <div class="pro-brand-text">
                <span>JR Booking Premium</span>
                <small>${UI_STRINGS.proDashboard.brandSmall}</small>
            </div>
        </div>
        <button class="mobile-menu-trigger" type="button" aria-expanded="false" aria-controls="pro-actions-menu" data-mobile-menu>${strings.mobileMenu}</button>
        <div id="pro-actions-menu" class="pro-actions">
            ${profileSelector}
            <div class="pro-account">
                <span class="eyebrow">Compte</span>
                <span class="pro-account-email"></span>
            </div>
            <div class="navbar-icon-group">
                <button class="icon-button navbar-icon-action" type="button" data-print aria-label="${strings.print}" title="${strings.print}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"/></svg></button>
                <button class="icon-button navbar-icon-action notification-trigger" type="button" data-notifications aria-label="${strings.notifications}" title="${strings.notifications}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8.5 12h5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"/></svg></button>
                ${canManageSettings ? `<div class="settings-menu" data-settings-menu>
                    <button class="icon-button navbar-icon-action" type="button" aria-expanded="false" aria-haspopup="true" data-settings-trigger aria-label="${strings.settings}" title="${strings.settings}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.1 3.5a7.9 7.9 0 0 0-.1-1l2-1.5-2-3.4-2.3.9a8.2 8.2 0 0 0-1.7-1L15.7 3h-4l-.3 3a8.2 8.2 0 0 0-1.7 1l-2.3-.9-2 3.4 2 1.5a7.9 7.9 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9a8.2 8.2 0 0 0 1.7 1l.3 3h4l.3-3a8.2 8.2 0 0 0 1.7-1l2.3.9 2-3.4-2-1.5a7.9 7.9 0 0 0 .1-1Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35"/></svg></button>
                    <div class="glass settings-menu-items" role="menu" aria-label="${strings.settingsLabel}">
                        ${strings.settingsItems.map((item, index) => `<button type="button" role="menuitem" data-settings-index="${index}">${item}</button>`).join("")}
                    </div>
                </div>` : ""}
                <button class="icon-button navbar-icon-action navbar-logout-action" type="button" data-logout aria-label="${strings.logout}" title="${strings.logout}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 16l4-4-4-4m4 4H8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"/></svg></button>
            </div>
        </div>
    `;

    container.querySelector(".pro-account-email").textContent = user.email || user.displayName || "Compte professionnel";
    const mobileMenu = container.querySelector("[data-mobile-menu]");
    const closeMobileMenu = () => {
        container.classList.remove("is-mobile-open");
        mobileMenu.setAttribute("aria-expanded", "false");
    };
    mobileMenu.addEventListener("click", () => {
        const isOpen = container.classList.toggle("is-mobile-open");
        mobileMenu.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", (event) => {
        if (!container.contains(event.target)) closeMobileMenu();
    });
    container.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileMenu();
            mobileMenu.focus();
        }
    });
    container.querySelector("[data-profile-switcher]")?.addEventListener("change", (event) => onProfileChange?.(event.target.value));
    const printButton = container.querySelector("[data-print]");
    const printMenu = document.createElement("div");
    printMenu.className = "settings-menu print-menu";
    printMenu.innerHTML = `<div class="glass settings-menu-items" role="menu" aria-label="${strings.printMenuLabel}"><label class="print-anonymous-toggle"><input type="checkbox" data-print-anonymous checked>${strings.anonymousPrintToggle}</label>${Object.entries(strings.printOptions).map(([mode, label]) => `<button type="button" role="menuitem" data-print-option="${mode}">${label}</button>`).join("")}</div>`;
    printButton.replaceWith(printMenu);
    const printTrigger = document.createElement("button");
    printTrigger.className = "icon-button navbar-icon-action";
    printTrigger.type = "button";
    printTrigger.setAttribute("aria-expanded", "false");
    printTrigger.setAttribute("aria-haspopup", "true");
    printTrigger.setAttribute("aria-label", strings.print);
    printTrigger.title = strings.print;
    printTrigger.innerHTML = printButton.innerHTML;
    printMenu.prepend(printTrigger);
    printTrigger.addEventListener("click", () => {
        const isOpen = printMenu.classList.toggle("is-open");
        printTrigger.setAttribute("aria-expanded", String(isOpen));
    });
    printMenu.querySelectorAll("[data-print-option]").forEach((item) => item.addEventListener("click", () => {
        printMenu.classList.remove("is-open");
        printTrigger.setAttribute("aria-expanded", "false");
        onPrint?.({ mode: item.dataset.printOption, anonymizeClients: printMenu.querySelector("[data-print-anonymous]").checked });
    }));
    container.querySelector("[data-notifications]").addEventListener("click", onNotifications);

    const settingsMenu = container.querySelector("[data-settings-menu]");
    const settingsTrigger = container.querySelector("[data-settings-trigger]");

    if (!settingsMenu || !settingsTrigger) {
        container.querySelector("[data-logout]").addEventListener("click", onLogout);
        return;
    }

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
                onQuickReplies?.();
            } else if (index === 6) {
                onDelegatedAccess?.();
            } else if (index === 7) {
                onDirectLinks?.();
            } else if (index === 8) {
                onPersonalInfo?.();
            } else if (index === 9) {
                onExportData?.();
            } else if (index === 10) {
                onClientDatabase?.();
            } else if (index === 11) {
                onStatistics?.();
            } else if (index === 12) {
                onNotificationPreferences?.();
            }
        });
    });
}

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character])); }