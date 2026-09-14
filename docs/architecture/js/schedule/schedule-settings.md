# Schedule settings

- **Production file:** `public/js/schedule/schedule-settings.mjs`
- **Purpose:** Normalizes the professional's reservation method, fixed-slot duration, recurrence bounds, multi-slot preferences, and activation mode.
- **Storage:** Settings are persisted inside `proProfiles/{proId}.workingHours.scheduleSettings` by `working-hours.js`.
- **Consumers:** `schedule-render.js` uses the normalized method, slot duration, and activation mode when creating or exposing professional slots; `profile-view.js` consumes the safe `publicProfiles.scheduleAvailability` projection for client-facing availability.
- **Public projection:** `buildPublicScheduleSettings` exposes only working days, start/end times, and bounded schedule settings. Private addresses, absence reasons, payment data, and client data are not included.
- **Validation:** Durations, slot counts, recurrence counts, and activation modes are bounded before persistence.
- **Verification:** `tests/schedule-settings.test.mjs` covers valid fixed-slot settings and invalid-value fallbacks.