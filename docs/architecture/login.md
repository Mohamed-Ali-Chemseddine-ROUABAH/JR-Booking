# Login page architecture

- **Production file:** `public/login.html`
- **Purpose:** Email/password sign-in shell for professional and client accounts, with password-reset feedback and role-home redirection after authentication.
- **Imports:** `public/js/core/strings-fr.js`, `public/js/core/auth-guard.js`, `public/js/shared/notifications.js`.
- **DOM owner:** The page owns its form controls and status text.
- **Firestore/Storage:** None.
- **Security rules:** Relies on Firebase Authentication; dashboard route permissions are enforced by `auth-guard.js` once protected pages exist.
- **Feature flag:** `authCore`, off until the Phase 2 verification entry passes.
- **Mockup references:** Auth shell behavior in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Phase 2 entry in `docs/verification/VERIFICATION_LOG.md`.