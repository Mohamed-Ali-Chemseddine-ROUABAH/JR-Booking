# Today view and notification center

- **Production file:** `public/js/pro-dashboard/today-view.js`
- **Purpose:** Renders the professional's current-day appointment summary and a compact notification panel from the already authorized booking DTOs, using the saved professional timezone. Verified client email is used as a booking-name fallback.
- **Imports:** Firestore query/update APIs, `core/firebase-init.js`, `core/strings-fr.js`, and `today-widget-toggle.mjs`.
- **DOM owner:** Owns the `[data-today-root]` summary and creates the notification dialog in `document.body`.
- **Firestore/Storage:** Reads the latest 30 `notifications/{uid}/items` and updates only `readAt`. No Storage access.
- **Security rules:** Users can read only their own notification collection and can update only nullable/timestamp `readAt`. The module receives only owner-authorized or server-sanitized active-profile booking DTOs.
- **Empty state:** With no appointments today, the summary becomes a compact keyboard-focusable bar. Hover opens it temporarily; click, tap, Enter, or Space toggles a pinned open state.
- **Integration:** `pro-dashboard.js` refreshes the widget whenever bookings refreshes; `navbar-pro.js` opens the notification panel. Selecting an item highlights the matching sidebar booking.
- **Timezone behavior:** `workingHours.timezone` controls current-day filtering, appointment times, booking notification times, and persisted notification timestamps, defaulting to `Europe/Paris`.
- **CRM timeline boundary:** the professional timezone is also passed to the unified client communication history so message and source-booking timestamps remain consistent with the professional schedule.
- **Scope boundary:** Persistent booking, message, and waitlist notifications plus read/unread state are implemented. Richer notification preferences remain later work.
- **Feature flag:** Professional dashboard notifications.
- **Mockup reference:** professional navbar notification bell and compact Today dashboard widget in `docs/requirements/MASTER_SPECIFICATION.md` Part 6.4 and `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Today view, persistent notifications, and waitlist-release entries in `docs/verification/VERIFICATION_LOG.md`.
