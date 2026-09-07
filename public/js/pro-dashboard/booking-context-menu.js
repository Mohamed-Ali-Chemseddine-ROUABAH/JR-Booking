import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.sidebar;

export function openBookingContextMenu({ booking, x, y, onStatusChange, onEdit }) {
    closeBookingContextMenu();
    const menu = document.createElement("div");
    menu.className = "booking-context-menu glass-ghost";
    menu.dataset.bookingContextMenu = "true";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", strings.contextMenuLabel);
    menu.style.left = `${Math.min(x, window.innerWidth - 230)}px`;
    menu.style.top = `${Math.min(y, window.innerHeight - 220)}px`;
    menu.innerHTML = [
        booking.status === "pending" ? menuButton("accepted", strings.acceptBooking) : "",
        booking.status === "pending" ? menuButton("rejected", strings.rejectBooking) : "",
        booking.status === "accepted" ? menuButton("done", strings.completeBooking) : "",
        booking.status === "accepted" ? menuButton("no-show", strings.noShowBooking) : "",
        menuButton("edit", strings.editBooking),
        booking.status !== "pending" ? menuButton("pending", strings.returnPending) : ""
    ].join("");
    document.body.append(menu);
    menu.querySelectorAll("[data-context-action]").forEach((button) => {
        button.addEventListener("click", async () => {
            closeBookingContextMenu();
            if (button.dataset.contextAction === "edit") {
                onEdit?.(booking);
            } else {
                await onStatusChange?.(booking.id, button.dataset.contextAction, booking.status);
            }
        });
    });
    window.setTimeout(() => document.addEventListener("click", closeBookingContextMenu, { once: true }), 0);
}

export function closeBookingContextMenu() {
    document.querySelector("[data-booking-context-menu]")?.remove();
}

function menuButton(action, label) {
    return `<button type="button" role="menuitem" data-context-action="${action}">${label}</button>`;
}