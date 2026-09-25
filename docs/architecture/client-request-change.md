# Client request-change architecture

- **Production file:** `public/js/client-dashboard/client-request-change.js`
- **Purpose:** Lets a client propose a new start/end time on a professional-made booking instead of accepting it outright; datetime fields use the persisted client timezone, and the booking is written back with the new time and kept `pending` so the professional reviews it before it is considered accepted, per Part 6.2 of the specification.
- **Imports:** `UI_STRINGS.clientDashboard.requestChange`, `updateBookingDetails` from `pro-dashboard/booking-actions.js` (reused as-is; the helper is not professional-specific).
- **DOM owner:** Creates and owns its modal root, appended to `document.body`, matching the `booking-creation.js` modal pattern.
- **Firestore:** Updates `bookings/{bookingId}` (`start`, `end`, `status: "pending"`), converting the client's timezone-local form values to absolute ISO timestamps before the trusted update.
- **Security rules:** `bookings/{bookingId}` update is allowed when the authenticated UID matches `clientId` or `proId`.
- **Mockup references:** Client date-change request flow in `docs/requirements/MASTER_SPECIFICATION.md` Part 6.2.
