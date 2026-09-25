const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let openModalCount = 0;

/**
 * Adds the focus management every `role="dialog"` needs: Escape to close, a focus trap,
 * body scroll lock, and focus restoration to whatever opened the modal.
 */
export function attachModalBehavior(modal, { onClose } = {}) {
    const previouslyFocused = document.activeElement;
    const dialog = modal.querySelector("[role='dialog'], form, section, article") || modal.firstElementChild || modal;

    if (openModalCount === 0) document.body.style.overflow = "hidden";
    openModalCount += 1;

    const focusables = () => [...dialog.querySelectorAll(FOCUSABLE)].filter((element) => element.offsetParent !== null || element === document.activeElement);

    const close = () => {
        if (!modal.isConnected) return;
        modal.remove();
        onClose?.();
    };

    const onKeyDown = (event) => {
        if (event.key === "Escape") {
            event.stopPropagation();
            close();
            return;
        }
        if (event.key !== "Tab") return;
        const items = focusables();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    modal.addEventListener("keydown", onKeyDown);

    new MutationObserver((records, observer) => {
        if (modal.isConnected) return;
        observer.disconnect();
        openModalCount = Math.max(0, openModalCount - 1);
        if (openModalCount === 0) document.body.style.overflow = "";
        if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus();
    }).observe(document.body, { childList: true });

    const initial = focusables()[0] || dialog;
    if (initial instanceof HTMLElement) initial.focus({ preventScroll: true });

    return close;
}
