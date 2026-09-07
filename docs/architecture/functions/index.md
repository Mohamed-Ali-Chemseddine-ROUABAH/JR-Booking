# Cloud Functions architecture

- **Production file:** `functions/index.js`
- **Purpose:** Phase 3 infrastructure stubs for audit logging and Google Calendar HTTP endpoints.
- **Imports:** `firebase-admin`, `firebase-functions/v2/firestore`, and `firebase-functions/v2/https`.
- **DOM owner:** None.
- **Firestore/Storage:** Writes audit entries into `logs`; Calendar handlers do not yet read or write data.
- **Security rules:** `logs` denies all client writes; Admin SDK writes bypass rules as intended.
- **Feature flag:** None for audit logging; Calendar behavior remains unavailable until Phase 14.
- **Mockup references:** Calendar OAuth is prototype-only until Phase 14.
- **Verification:** Phase 3 syntax check and emulator/deploy pipeline check.