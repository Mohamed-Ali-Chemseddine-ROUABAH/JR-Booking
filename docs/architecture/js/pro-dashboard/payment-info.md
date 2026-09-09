# Payment information module

- **Production file:** `public/js/pro-dashboard/payment-info.js`
- **Purpose:** Opens the professional payment settings popup and persists optional payment methods, bank details, custom links, Wero contact data, and the professional's rate per time unit.
- **Imports:** Firebase Firestore, `firebase-init.js`, and French UI strings.
- **DOM owner:** Creates and owns the payment settings modal; the professional navbar opens it through `pro-dashboard.js`.
- **Firestore/Storage:** Reads and writes `proProfiles/{proId}.paymentInfo` and preserves the document `owners` array.
- **Security rules:** `proProfiles` remains readable and writable only by the owning professional or an admin. Payment data is not written to the public profile.
- **Feature flag:** `paymentInfo`, pending human verification.
- **Mockup references:** Professional settings and payment details in `docs/mockups/MASTER_MOCKUP.md`.
- **Verification:** Phase 10 payment-info implementation entry in `docs/verification/VERIFICATION_LOG.md`.
