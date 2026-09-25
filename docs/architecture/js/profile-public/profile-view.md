# Public profile view module

- **Production file:** `public/js/profile-public/profile-view.js`
- **Purpose:** Loads a public profile by the `?pro=` query parameter, renders visible fields and anonymous busy schedule blocks with 1/3/7-day views and period navigation, and creates authenticated client booking requests.
- **Imports:** Firebase Firestore, `auth-guard.js`, `firebase-init.js`, and `strings-fr.js`.
- **DOM owner:** `profile.html` delegates its profile, schedule, and booking-form regions to this module.
- **Firestore/Storage:** Reads `publicProfiles.scheduleAvailability` and the professional's `busySlots` subcollection; writes pending `bookings` with the signed-in user's UID as `clientId` and `createdBy`. Only safe working-day, working-time, and schedule-mode settings are mirrored publicly.
- **Security rules:** Anonymous reads are limited to the public mirror collections. Booking creation is limited to the involved authenticated client through `firestore.rules`.
- **Feature flag:** `publicSearchAndSchedule`, pending human verification.
- **Mockup references:** Public profile schedule, 1/3/7-day view switcher, period navigation, and booking request flow in `docs/mockups/IMPLEMENTATION_REFERENCE.md`, `docs/mockups/MASTER_MOCKUP.md`, and the public discovery mockup references.
- **Schedule parity:** The public schedule must retain the approved day-column hierarchy, occupied/available treatments, booking entry interaction, responsive behavior, and French status labels while exposing only anonymous `busySlots` data.
- **Navigation behavior:** Previous/next moves by the selected number of days and Aujourd'hui returns to the current period. Changing 1/3/7-day mode resets to the current period and recalculates the grid without exposing private booking details.
- **Timezone behavior:** Public schedule dates, weekday labels, minimum booking date, occupied-slot matching, and conflict checks use the professional's mirrored `scheduleAvailability.timezone` (falling back to the profile timezone and then `Europe/Paris`), not the visitor's browser timezone.
- **Booking timestamps:** date/time form values are interpreted in the professional timezone and converted to absolute ISO timestamps before booking or waitlist writes.
- **Verification:** Public Discovery and Anonymous Schedule entry in `docs/verification/VERIFICATION_LOG.md`.
