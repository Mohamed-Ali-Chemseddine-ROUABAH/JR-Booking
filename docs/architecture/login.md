# Login page architecture

- **Production file:** `public/login.html`
- **Purpose:** Email/password and optional email-link sign-in shell for client accounts, with password-reset feedback and validated same-origin return to a public booking selection.
- **Imports:** `public/js/core/strings-fr.js`, `public/js/core/auth-guard.js`, `public/js/shared/notifications.js`.
- **DOM owner:** The page owns its form controls and status text.
- **Firestore/Storage:** None.
- **Security rules:** Relies on Firebase Authentication; dashboard route permissions are enforced by `auth-guard.js` once protected pages exist.
- **Feature flag:** `authCore`, off until the Phase 2 verification entry passes.
- **Mockup references:** Auth shell behavior in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Phase 2 entry in `docs/verification/VERIFICATION_LOG.md`.
- **Booking continuation:** A `returnTo` profile path is accepted only when it is same-origin and contains allowlisted public profile/service/date/time values. Password and email-link sign-in return to that selection; email verification itself never creates a booking.