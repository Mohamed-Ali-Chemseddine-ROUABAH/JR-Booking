# Support and data requests architecture

- **Production files:** `public/js/shared/support-requests.js`, `public/js/shared/support-request-policy.mjs`, and `functions/support-request-notifications.js`
- **Purpose:** Gives authenticated clients and professionals one shared modal for contacting platform support or requesting their own data, and shows their request history plus admin replies.
- **Firestore:** Creates one bounded document in `supportTickets/{ticketId}` or `dataRequests/{requestId}` with `createdBy`, `subject`, `details`, `status: "pending"`, `createdAt`, and `updatedAt`. Admin replies are stored as a bounded `adminReply`, move the request to `in-progress`, and trigger one persisted requester notification (`support-ticket-reply` or `data-request-reply`).
- **Security rules:** Creation requires the authenticated UID to equal `createdBy`; subject and details have bounded lengths and no additional fields are accepted. The creator may edit only subject/details/timestamp, while only admins may change status or add `adminReply`.
- **UI ownership:** The action is exposed by both client and professional navbar modules; the shared module owns the modal and submit state.
- **Verification:** `tests/support-requests.test.mjs` covers browser-independent request normalization, incomplete-request rejection, bounded requester-reply payloads, and ban-review notification policy. Firestore rules must compile before deployment.
- **Mockup references:** Dashboard account/support interaction and modal treatment in `docs/mockups/MASTER_MOCKUP.md` and `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
