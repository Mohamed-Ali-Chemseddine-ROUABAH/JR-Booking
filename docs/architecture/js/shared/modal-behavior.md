# Modal behavior architecture

- **Production file:** `public/js/shared/modal-behavior.js`
- **Purpose:** Supply the focus management every `role="dialog"` overlay needs — Escape to close, a Tab/Shift+Tab focus trap scoped to the dialog, a body scroll lock reference-counted across stacked modals, and focus restoration to the element that opened the modal.
- **Imports:** None.
- **DOM owner:** Operates on the modal element passed by the caller; temporarily sets `document.body.style.overflow` while at least one modal is open.
- **Firestore/Storage:** None.
- **Security rules:** None; the module only manages focus and keyboard events.
- **Callers:** Every modal call site under `public/js/**` calls `attachModalBehavior(modal)` immediately after `document.body.append(modal)`.
- **Mockup references:** `.modal-backdrop` / `.modal-card` / `.modal-head` in `docs/mockups/jr-booking-premium-mockup.html`.
- **Verification:** Full-surface mockup component parity entry in `docs/verification/VERIFICATION_LOG.md`.
