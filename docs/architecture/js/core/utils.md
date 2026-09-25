# Shared utilities architecture

- **Production file:** `public/js/core/utils.js`
- **Purpose:** Small browser-safe helpers for debouncing, escaping rendered text, and normalizing French search terms.
- **Related datetime contract:** `public/js/core/datetime-utils.mjs` owns timezone-local form conversion, ISO round-tripping, and local range validation for booking boundaries.
- **Imports:** None.
- **DOM owner:** None.
- **Firestore/Storage:** None.
- **Security rules:** None; escaping is presentation hygiene, not an authorization boundary.
- **Feature flag:** None.
- **Mockup references:** Shared foundation utilities in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Shared UI foundation entry in `docs/verification/VERIFICATION_LOG.md`.
