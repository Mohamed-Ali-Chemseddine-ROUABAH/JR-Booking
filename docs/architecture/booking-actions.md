# Booking actions architecture

- **Production files:** `public/js/pro-dashboard/booking-actions.js`, `public/js/sidebar/sidebar-feed.js`
- **Purpose:** Lets the owning professional accept, reject, or complete an authorized booking from the sidebar.
- **Firestore:** Updates `bookings/{bookingId}.status`.
- **Allowed transitions:** `pending` to `accepted` or `rejected`; `accepted` to `done` or `no-show`.
- **Security rules:** Firestore booking updates require the authenticated professional to own the booking, or an admin role.
- **Privacy:** Actions are exposed only inside the authenticated professional dashboard; rejection requires a plain-French confirmation.
- **Sidebar filters:** Pending is the default view; accepted includes accepted, done, and no-show records; rejected records appear only when the rejected filter is selected.
- **Modification:** The sidebar `Modifier` action validates contact roles, additional notification emails, and that the end is after the start. For recurring series it requires an explicit scope: this booking, this-and-following, or the full series. The server records previous values, the actor, the scope, and affected occurrences; notification delivery is queued separately and cannot roll back the booking change.