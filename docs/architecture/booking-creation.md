# Booking creation architecture

- **Production file:** `public/js/pro-dashboard/booking-creation.js`
- **Purpose:** Creates a professional-made pending booking from an available schedule cell, either a single double-clicked hour or a drag-selected multi-hour range from `schedule-render.js` (`details.endHour` overrides the default one-hour end time when present).
- **Firestore:** Creates `bookings/{bookingId}` with `proId`, nullable `clientId`, explicit guest/contact roles, optional additional notification contacts, start/end values, `pending` status, creator UID, and creation timestamp. Contact emails never grant read access.
- **Security rules:** The existing booking create rule requires an authenticated user and a pending status with the authenticated UID matching `proId` or `clientId`; this professional-created flow uses `proId`. Future guest/contact creation must use a trusted server boundary or a narrowly extended rule; it must not weaken booking reads or let a client write identity/contact fields arbitrarily.
- **Privacy:** Guest contact details are written to a professional-owned booking and are not rendered on public schedule surfaces.
- **Linking rule:** A later verified client may claim only a specifically identified booking through a single-use claim flow; matching an email does not automatically merge histories or grant access to other bookings.
- **Claim conflict rule:** If more than one verified person could plausibly claim a booking, the server leaves the booking unchanged and creates an auditable review-needed state rather than choosing an owner.
- **Mockup references:** Professional double-click schedule creation and pending booking state in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and `docs/mockups/jr-booking-premium-mockup.html`.