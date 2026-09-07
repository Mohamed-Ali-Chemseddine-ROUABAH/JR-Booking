# Client registration page architecture

- **Production file:** `public/register-client.html`
- **Purpose:** Phase 2 client self-registration with email, password, display name, and local password confirmation.
- **Imports:** `public/js/core/strings-fr.js`, `public/js/core/auth-guard.js`, `public/js/shared/notifications.js`.
- **DOM owner:** The page owns its registration form controls and status text.
- **Firestore/Storage:** None in Phase 2; account data is created in Firebase Authentication only.
- **Security rules:** No Firestore rule changes until Phase 3.
- **Feature flag:** `authCore`, off until the Phase 2 verification entry passes.
- **Mockup references:** Auth shell behavior in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Phase 2 entry in `docs/verification/VERIFICATION_LOG.md`.