# Quick replies

- **Production file:** `public/js/pro-dashboard/quick-replies.js`
- **Purpose:** Lets the owner of the active professional profile create, edit, and remove up to 20 reusable French message templates.
- **Imports:** Firestore document APIs, `core/firebase-init.js`, and `core/strings-fr.js`.
- **DOM owner:** Creates and owns the quick-reply settings modal.
- **Firestore/Storage:** Reads and updates `proProfiles/{profileId}.quickReplies`, with `{label, body}` entries capped at 80 and 1000 characters. No Storage access.
- **Security rules:** `proProfiles` rules restrict reads and updates to profile owners or administrators. Templates are never copied to public profiles, client accounts, bookings, or mail documents.
- **Integration:** `public/js/shared/booking-messages.js` receives the active `profileId` separately from the acting Auth UID, reads that profile's templates, and places the selected body into the booking-message composer. Sending still attributes the message to the acting user through `sendBookingMessage`.
- **Feature flag:** Professional messaging tools.
- **Mockup reference:** Professional settings menu and booking message composer in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Professional quick replies entry in `docs/verification/VERIFICATION_LOG.md`.
