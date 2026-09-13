# Booking preparation notes

- **Production file:** `public/js/pro-dashboard/booking-prep-notes.js`
- **Purpose:** Lets an authorized professional keep a short private preparation note on one booking.
- **Imports:** Firebase Functions callable API, `core/firebase-init.js`, and `core/strings-fr.js`.
- **DOM owner:** Creates and owns the preparation-note modal opened from the professional sidebar or booking context menu.
- **Firestore/Storage:** Trusted callables read/write only `bookings/{bookingId}/private/professional`, with `prepNotes` capped at 2000 characters. No Storage access.
- **Security rules:** Only the profile owner or an administrator can read/write the private subdocument. Clients, shared-history users, and delegates are denied; `prepNotes` is not allowed on the parent booking.
- **Feature flag:** Professional booking operations.
- **UI:** Empty content clears the note; controls stay disabled until the private note has loaded.
- **Mockup reference:** Professional booking context menu and sidebar private-note action in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Private booking preparation notes and delegated-access entries in `docs/verification/VERIFICATION_LOG.md`; emulator denial coverage in `tests/delegated-access-emulator.test.cjs`.
