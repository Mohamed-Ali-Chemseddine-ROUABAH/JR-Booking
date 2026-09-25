# Client bookings architecture

- **Production file:** `public/js/client-dashboard/client-bookings.js`
- **Purpose:** Renders the client's own and authorized shared-history bookings sidebar with pending/accepted/rejected filter chips, formats dates in the persisted client timezone, and marks professional-made pending bookings as awaiting the client's confirmation (`booking.createdBy` set to the professional's UID rather than the client's).
- **Imports:** `UI_STRINGS.clientDashboard.bookings`, `escapeHtml` from `core/utils.js`.
- **DOM owner:** Creates and owns the sidebar markup passed to it; booking actions are delegated back to `client-dashboard.js` through `onAccept`, `onCancel`, and `onRequestChange` callbacks.
- **Firestore:** No direct reads/writes; `client-dashboard.js` supplies the booking DTOs (queried by `clientId == uid`) and performs the Firestore writes.
- **Security rules:** Booking reads/updates are limited by `firestore.rules` to the involved client, professional, or admin.
- **Mockup references:** Client dashboard bookings sidebar with pending/accepted/rejected status in `docs/requirements/MASTER_SPECIFICATION.md` Part 7.
