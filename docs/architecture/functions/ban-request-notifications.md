# Ban request notifications architecture

- **Production file:** `functions/ban-request-notifications.js`
- **Purpose:** Provides the pure policy for notifying a professional when an admin approves or refuses a client platform-ban escalation.
- **Contract:** Emits `platform-ban-approved` or `platform-ban-rejected` with the CRM record ID, bounded French title/body, and unread state. Notifications are generated only when a pending escalation changes to a reviewed status.
- **Security boundary:** The helper contains no authorization or direct Firestore access. The trusted `createBanReviewNotification` trigger uses the server-controlled `platformBanRequest.requestedBy` UID; Firestore notification rules enforce owner-only reads and read-state updates.
- **Consumer:** `functions/index.js` trigger on `proClientRecords/{recordId}`.
- **Verification:** `tests/support-requests.test.mjs` covers reviewed-status detection and payload shape; full emulator validation is required before deployment.
