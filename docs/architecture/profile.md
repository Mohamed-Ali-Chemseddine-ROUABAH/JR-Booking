# Public profile architecture

- **Production file:** `public/profile.html`
- **Purpose:** Anonymous professional profile view with visible public fields, public busy-slot schedule, and client booking request entry point.
- **Imports:** `public/js/profile-public/profile-view.js`, shared Firebase/Auth modules, and French UI strings.
- **DOM owner:** The page owns the profile shell; `profile-view.js` owns profile data, schedule slots, and request form state.
- **Firestore/Storage:** Reads `publicProfiles/{proId}` and `busySlots/{proId}/slots/{slotId}` anonymously. Authenticated clients create `bookings/{bookingId}` with `clientId` equal to their Firebase UID.
- **Security rules:** Public profile and busy-slot reads are anonymous. Booking creation requires a signed-in user, `status == "pending"`, and `clientId == request.auth.uid`.
- **Feature flag:** `publicSearchAndSchedule`, pending human verification.
- **Mockup references:** Public profile and `Occupé` schedule blocks in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and `docs/mockups/MASTER_MOCKUP.md`.
- **Verification:** Public Discovery and Anonymous Schedule entry in `docs/verification/VERIFICATION_LOG.md`.
