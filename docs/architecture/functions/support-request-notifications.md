# Support request notifications architecture

- **Production file:** `functions/support-request-notifications.js`
- **Purpose:** Provides pure policies for notifying request creators when admins reply to support tickets or personal data requests.
- **Contract:** Emits bounded `support-ticket-reply` or `data-request-reply` payloads with the request ID, reply preview, title, and unread state. A notification is created only when a new admin reply appears.
- **Security boundary:** The helper contains no authorization or direct Firestore access. Trusted Firestore triggers use the server-controlled `createdBy` UID; notification rules enforce owner-only reads and read-state updates.
- **Consumers:** `createSupportReplyNotification` and `createDataRequestReplyNotification` in `functions/index.js`.
- **Verification:** `tests/support-requests.test.mjs` covers bounded payloads and new-reply detection; full emulator validation is required before deployment.
