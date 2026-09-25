# Unified client communication history

- **Production file:** `public/js/pro-dashboard/client-communication-history.js`
- **Purpose:** Shows a professional one chronological view of messages exchanged across all bookings for one client.
- **Imports:** Firestore collection/query APIs, `core/firebase-init.js`, `core/strings-fr.js`, and `core/utils.js`.
- **DOM owner:** Creates and owns the client communication-history modal.
- **Firestore/Storage:** Reads `bookings/{bookingId}/messages` for booking IDs already loaded into the owner's client record. It performs no writes and uses no Storage.
- **Security rules:** The owner-only CRM supplies active-profile bookings; message rules independently enforce the booking participant/profile boundary. Delegates do not receive the owner CRM settings surface.
- **UI:** The CRM client editor opens the timeline without replacing the client record editor. Each entry identifies the sender, message date, and source booking date; empty and load-error states are explicit.
- **Feature flag:** Professional CRM.
- **Mockup reference:** CRM client history and reservation message-thread surfaces in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Unified client communication history entry in `docs/verification/VERIFICATION_LOG.md`.
