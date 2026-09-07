# Booking creation architecture

- **Production file:** `public/js/pro-dashboard/booking-creation.js`
- **Purpose:** Creates a professional-made pending booking from an available schedule cell, either a single double-clicked hour or a drag-selected multi-hour range from `schedule-render.js` (`details.endHour` overrides the default one-hour end time when present).
- **Firestore:** Creates `bookings/{bookingId}` with `proId`, guest contact details, start/end values, `pending` status, creator UID, and creation timestamp.
- **Security rules:** The booking create rule requires an authenticated user and a pending status with the authenticated UID matching `proId` or `clientId`; this flow uses `proId`.
- **Privacy:** Guest contact details are written to a professional-owned booking and are not rendered on public schedule surfaces.
- **Mockup references:** Professional double-click schedule creation and pending booking state in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and `docs/mockups/jr-booking-premium-mockup.html`.