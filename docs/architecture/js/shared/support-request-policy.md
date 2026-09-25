# Support request policy architecture

- **Production file:** `public/js/shared/support-request-policy.mjs`
- **Purpose:** Provides browser-independent normalization and validation for authenticated support-ticket and personal-data-request payloads.
- **Contract:** Trims subjects/details, caps subject length at 120 characters and details at 2000 characters, requires a creator UID, and initializes requests with `status: "pending"`.
- **Security boundary:** This helper is not an authorization layer. Firestore rules independently enforce creator ownership, allowed fields, bounded values, and admin-only status/reply changes.
- **Consumers:** `public/js/shared/support-requests.js` and `tests/support-requests.test.mjs`.
- **Verification:** Node tests cover normalization and incomplete-request rejection without importing Firebase browser modules.
