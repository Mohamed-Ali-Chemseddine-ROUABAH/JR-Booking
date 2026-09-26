# Auth guard architecture

- **Production file:** `public/js/core/auth-guard.js`
- **Purpose:** Centralize Firebase Auth calls for sign-in, client registration, password-reset and email-verification mail, verification refresh, sign-out, role detection, and protected-route checks.
- **Imports:** Firebase Auth browser modules from the pinned CDN version, `public/js/core/firebase-init.js`, and `public/js/core/strings-fr.js`.
- **DOM owner:** None.
- **Firestore/Storage:** None.
- **Security rules:** Does not replace Firestore rules. It only gates browser routes; server-side authorization is added through rules in Phase 3.
- **Planned client access decision:** Firebase email/password remains the baseline. Optional Firebase email-link sign-in may be offered as a secondary method; Firebase owns token expiry and one-time consumption, while the request boundary rate-limits sends and the UI handles new devices, expired/used/forwarded links, inaccessible email, password sign-in, and password reset. A 3- or 4-digit PIN is not an acceptable sole credential for private bookings, messages, or payment context.
- **Legal acceptance boundary:** Registration reads the active `YYYY-MM-DD` versions from `platformConfig/legal` and submits them to a trusted handler. The handler writes a new immutable `legalAcceptances` record after verifying the authenticated UID and current versions. Editable client metadata and the checkbox alone are not acceptance evidence; a later required version creates a new event.
- **Custom-claim freshness:** `getUserRole()` forces an ID-token refresh (`getIdTokenResult(user, true)`) on every `requireAuth` page load. Without this, a session that predates a server-side custom-claim change (e.g. admin provisioning) keeps sending a stale token to callable Functions, and role-gated callables reject it with `permission-denied`.
- **Verified booking:** `sendClientVerificationEmail()` uses Firebase Auth's verification email and a validated same-origin continuation; `refreshClientEmailVerification()` reloads the user and forces an ID-token refresh before the public booking UI opens. Firestore rules remain the authoritative `email_verified` check.
- **Feature flag:** `authCore`, off until verified.
- **Mockup references:** Login role preview, registration form, and reset feedback in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Phase 2 entry in `docs/verification/VERIFICATION_LOG.md`.