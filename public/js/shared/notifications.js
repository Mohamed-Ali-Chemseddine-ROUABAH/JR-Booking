import { UI_STRINGS } from "../core/strings-fr.js";

export function showNotification(message, type = "info", action) {
    let region = document.querySelector("[data-notification-region]");

    if (!region) {
        region = document.createElement("div");
        region.dataset.notificationRegion = "true";
        region.setAttribute("role", "status");
        region.setAttribute("aria-live", "polite");
        document.body.append(region);
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    const messageText = document.createElement("span");
    messageText.textContent = message;
    notification.append(messageText);
    if (action) {
        const actionButton = document.createElement("button");
        actionButton.className = "notification-action";
        actionButton.type = "button";
        actionButton.textContent = action.label;
        actionButton.addEventListener("click", async () => {
            actionButton.disabled = true;
            await action.onClick();
            notification.remove();
        });
        notification.append(actionButton);
    }
    region.append(notification);

    window.setTimeout(() => notification.remove(), 4500);
}

export function showSearchUnavailable() {
    showNotification(UI_STRINGS.search.unavailable, "info");
}
