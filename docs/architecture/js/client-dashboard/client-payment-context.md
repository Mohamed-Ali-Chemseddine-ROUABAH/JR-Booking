# Client payment context architecture

- **Production file:** `public/js/client-dashboard/client-payment-context.js`
- **Purpose:** Lets a client choose an active reservation and view only the payment options and balance authorized for that booking, with reservation choices formatted in the persisted client timezone.
- **Imports:** `strings-fr.js` and `escapeHtml` from `core/utils.js`.
- **DOM owner:** Creates and owns the payment modal opened from the client navbar.
- **Firestore/Storage:** No direct reads or writes; receives booking DTOs from `client-dashboard.js`.
- **Security rules:** The client receives payment data only through their own authorized booking. It never reads `proProfiles` directly. External payment links open in a new tab; JR Booking Premium never processes a transaction.
- **Feature flag:** `paymentContext`, pending authenticated browser verification.
- **Mockup references:** Client payment selection and active-reservation context in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and `MASTER_MOCKUP.md`.
- **Verification:** Phase 10 client payment-context entry in `docs/verification/VERIFICATION_LOG.md`.
