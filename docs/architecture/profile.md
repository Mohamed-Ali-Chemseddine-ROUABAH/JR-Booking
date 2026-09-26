# Public profile architecture

- **Production file:** `public/profile.html`
- **Purpose:** Anonymous professional profile view with visible public fields, a vertical time-axis schedule with days as columns and public busy-slot cells, anonymous slot selection, and an explicitly confirmed client booking request gated by verified email.
- **Imports:** `public/js/profile-public/profile-view.js`, shared Firebase/Auth modules, and French UI strings.
- **DOM owner:** The page owns the profile shell; `profile-view.js` owns profile data, schedule slots, and request form state.
- **Firestore/Storage:** Reads `publicProfiles/{proId}` and `busySlots/{proId}/slots/{slotId}` anonymously. Clients create pending `bookings/{bookingId}` only after Auth email verification, with UID-bound `clientId`/`createdBy` and `clientEmail` from the verified Auth identity.
- **Security rules:** Public profile and busy-slot reads are anonymous. Booking creation requires `request.auth.token.email_verified == true`, `clientEmail == request.auth.token.email`, `status == "pending"`, and `clientId`/`createdBy == request.auth.uid`.
- **Feature flag:** `publicSearchAndSchedule`, pending human verification.
- **Mockup references:** Public profile and `Occupé` schedule blocks in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and `docs/mockups/MASTER_MOCKUP.md`.
- **Verification:** Public Discovery and Anonymous Schedule entry in `docs/verification/VERIFICATION_LOG.md`.
- **Visual behavior:** Time progresses top-to-bottom; every day column preserves empty and occupied cells so gaps remain visible. The schedule horizontally scrolls within its own region on narrow screens rather than collapsing time order.
