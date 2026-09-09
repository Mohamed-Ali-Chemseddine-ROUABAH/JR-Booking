# Cloud Functions architecture

- **Production file:** `functions/index.js`
- **Purpose:** Audit logging, Google Calendar OAuth entry points, and privileged account provisioning/lifecycle.
- **Imports:** `firebase-admin`, `firebase-functions/v2/firestore`, and `firebase-functions/v2/https`.
- **DOM owner:** None.
- **Firestore/Storage:** Writes audit entries into `logs`; OAuth state is stored briefly in `calendarOAuthStates`; refresh tokens are stored only in `gcalTokens/{uid}`; provisioning and lifecycle functions update authorized profile records.
- **Security rules:** `logs` denies all client writes; Admin SDK writes bypass rules as intended.
- **Feature flag:** None for audit logging; Calendar OAuth requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, and `GOOGLE_CALENDAR_SCOPES` deployment configuration.
- **Mockup references:** Calendar OAuth is prototype-only until Phase 14.
- **Verification:** Phase 3 syntax check and emulator/deploy pipeline check.