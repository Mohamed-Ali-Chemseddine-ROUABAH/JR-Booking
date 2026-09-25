# Notification preferences

- **Production file:** `public/js/pro-dashboard/notification-preferences.js`
- **Purpose:** Lets an authenticated client or professional choose immediate, daily-digest, or no email for new messages, booking changes, and appointment reminders.
- **Imports:** Firestore document APIs, `core/firebase-init.js`, and `core/strings-fr.js`.
- **DOM owner:** Creates and owns the notification-preferences modal opened from the professional or client account menu.
- **Firestore/Storage:** Reads and writes `notificationPreferences/{uid}`. No Storage access.
- **Security rules:** The authenticated owner can read and update only their own bounded preference fields; admins can read or delete the document. Preference values are restricted to `immediate`, `digest`, or `none`.
- **Delivery boundary:** Message notifications queue immediately for `messageEmail: immediate`. `dailyMessageDigestWorker` runs during the 08:00-08:15 Europe/Paris window, batches unread booking-message, booking-change, and reminder notifications once per recipient/day, and queues one `booking-message-digest` mail document. Booking changes and reminders queue deterministic immediate mail documents only when their preference is `immediate`; `none` suppresses mail while preserving in-app notifications.
- **Feature flag:** Authenticated notification settings.
- **Mockup references:** Professional notification controls and account settings in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and `docs/requirements/MASTER_SPECIFICATION.md` Part 6.4.
