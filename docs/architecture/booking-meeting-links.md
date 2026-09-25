# Booking meeting links

- **Production owners:** `functions/index.js` (`updateBookingMeetingLinks`), `public/js/pro-dashboard/booking-context-menu.js`, `public/js/pro-dashboard/pro-dashboard.js`.
- **Purpose:** Lets the owning professional attach up to five labeled HTTPS meeting links to a booking and replace/remove them from the booking context menu.
- **Firestore:** Stores sanitized `bookings/{bookingId}.meetingLinks` entries with `label` and `url`; the callable writes an audit event.
- **Security:** Only the owning professional can update links; direct Firestore updates are not allowed through the professional booking allow-list unless authorized fields are preserved by the existing rule boundary.
- **Client visibility:** Authorized booking participants read the links through the booking they already can access; unrelated users never receive booking data.
- **Verification:** Add/update/remove links through the context menu and verify the links appear only on the authorized booking surface.
