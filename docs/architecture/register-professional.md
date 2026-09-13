# Professional creation-link registration

- **Production file:** `public/register-professional.html`
- **Purpose:** Redeems an administrator-issued professional creation link, sets the initial password, and provisions the professional identity and profile.
- **Imports:** Firebase Functions callable client and `public/js/core/firebase-init.js`.
- **DOM owner:** The page owns the display-name, password, and status controls.
- **Firestore/Storage:** The browser never reads or writes `creationLinks`, `proProfiles`, or `publicProfiles`. `redeemProfessionalCreationLink` validates the hashed token server-side, decrements remaining uses, creates the Auth user, assigns professional claims, and provisions the private/public profile pair.
- **Security rules:** `creationLinks` denies all direct browser writes and reads. The callable accepts only an unguessable token, enforces expiry and usage limits, and stores only the token hash.
- **Feature flag:** Admin creation-link flow; disabled until its verification entry passes.
- **Mockup references:** Admin command center and professional account-creation flow in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and Part 8 of the Master Specification.
- **Verification:** Local emulator lifecycle must cover valid redemption, invalid/expired/revoked token, usage exhaustion, profile provisioning, professional custom claims, and replay denial.
