# Auth guard architecture

- **Production file:** `public/js/core/auth-guard.js`
- **Purpose:** Centralize Firebase Auth calls for Phase 2: sign-in, client registration, password-reset email, sign-out, role detection, and protected-route checks.
- **Imports:** Firebase Auth browser modules from the pinned CDN version, `public/js/core/firebase-init.js`, and `public/js/core/strings-fr.js`.
- **DOM owner:** None.
- **Firestore/Storage:** None.
- **Security rules:** Does not replace Firestore rules. It only gates browser routes; server-side authorization is added through rules in Phase 3.
- **Feature flag:** `authCore`, off until verified.
- **Mockup references:** Login role preview, registration form, and reset feedback in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Phase 2 entry in `docs/verification/VERIFICATION_LOG.md`.