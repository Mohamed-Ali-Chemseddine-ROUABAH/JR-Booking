# Notifications architecture

- **Production file:** `public/js/shared/notifications.js`
- **Purpose:** Own the accessible live notification region used by production pages.
- **Imports:** `public/js/core/strings-fr.js`.
- **DOM owner:** The module owns `[data-notification-region]` and its notification children.
- **Firestore/Storage:** None.
- **Security rules:** None; the module renders supplied UI messages only.
- **Feature flag:** `sharedUiFoundation`, off until verified.
- **Mockup references:** Toast behavior in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Shared UI foundation entry in `docs/verification/VERIFICATION_LOG.md`.
