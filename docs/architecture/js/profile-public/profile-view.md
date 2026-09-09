# Public profile view module

- **Production file:** `public/js/profile-public/profile-view.js`
- **Purpose:** Loads a public profile by the `?pro=` query parameter, renders visible fields and busy schedule blocks, and creates authenticated client booking requests.
- **Imports:** Firebase Firestore, `auth-guard.js`, `firebase-init.js`, and `strings-fr.js`.
- **DOM owner:** `profile.html` delegates its profile, schedule, and booking-form regions to this module.
- **Firestore/Storage:** Reads `publicProfiles` and the professional's `busySlots` subcollection; writes pending `bookings` with the signed-in user's UID as `clientId` and `createdBy`.
- **Security rules:** Anonymous reads are limited to the public mirror collections. Booking creation is limited to the involved authenticated client through `firestore.rules`.
- **Feature flag:** `publicSearchAndSchedule`, pending human verification.
- **Mockup references:** Public profile schedule and booking request flow in the public discovery mockup references.
- **Verification:** Public Discovery and Anonymous Schedule entry in `docs/verification/VERIFICATION_LOG.md`.
