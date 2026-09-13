# Delegated access

- **Production file:** `public/js/pro-dashboard/delegated-access.js`
- **Purpose:** Lets a professional owner grant or remove profile-scoped access for an existing Firebase Auth account.
- **Imports:** Firestore document reads, Firebase Functions callable API, `core/firebase-init.js`, and `core/strings-fr.js`.
- **DOM owner:** Creates and owns the delegated-access settings modal.
- **Firestore/Storage:** Owners read their private `proProfiles/{profileId}.delegates` map. Trusted callables update delegation entries, claims, and audit logs. No Storage access.
- **Security rules:** Delegates cannot read bookings directly. `listDelegatedBookings` verifies the active profile entry and returns only scheduling/service/status fields; client identity, contacts, address, intake, payment, movement, pricing, and notes are omitted. `manageBookings` controls operational mutation and `manageMessages` controls thread read/send.
- **Trusted boundary:** Add/remove operations maintain a bounded `delegateProfileIds` claim so removing one assignment preserves others. Every action remains attributed to the delegate Auth UID.
- **Dashboard:** A delegate can switch among assigned profiles, receives only controls covered by the active permissions, and never receives owner settings.
- **Feature flag:** Professional delegated access.
- **Mockup reference:** Professional settings delegated-access panel and restricted booking-management actions in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Profile-scoped delegated access entry in `docs/verification/VERIFICATION_LOG.md` and `tests/delegated-access-emulator.test.cjs`.
