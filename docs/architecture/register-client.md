# Client registration page architecture

- **Production file:** `public/register-client.html`
- **Purpose:** Client self-registration with email, password, display name, local password confirmation, required terms/privacy acknowledgement, and Firebase email verification before public-profile booking.
- **Imports:** `public/js/core/strings-fr.js`, `public/js/core/auth-guard.js`, `public/js/core/firebase-init.js`, Firebase Functions callable client, and `public/js/shared/notifications.js`.
- **DOM owner:** The page owns its registration form controls and status text.
- **Firestore/Storage:** The browser does not write Firestore directly. After Auth creation, trusted `getCurrentLegalVersions` and `recordLegalAcceptance` Functions write immutable `legalAcceptances/{acceptanceId}` evidence. Firebase Auth sends a verification link whose continuation carries only the validated public booking selection.
- **Security rules:** `legalAcceptances` denies all direct client writes and permits a user to read only their own records. The account cannot create a client booking until the refreshed Auth token reports a verified email.
- **Feature flag:** `authCore`, off until the Phase 2 verification entry passes.
- **Mockup references:** Auth shell behavior in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Phase 2 entry in `docs/verification/VERIFICATION_LOG.md`.