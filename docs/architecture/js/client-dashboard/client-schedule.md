# Client schedule architecture

- **Production file:** `public/js/client-dashboard/client-schedule.js`
- **Purpose:** Renders the client's read-only seven-day schedule from the client's own bookings using the persisted client timezone, with previous/current/next week navigation and the same schedule-head hierarchy and dashboard panel treatment as the professional schedule.
- **Imports:** `strings-fr.js` and `escapeHtml` from `core/utils.js`.
- **DOM owner:** Owns the `data-client-schedule-root` region in `client-dashboard.html`.
- **Firestore/Storage:** No direct reads; `client-dashboard.js` supplies authorized bookings and the saved `clientAccounts/{uid}.timezone` value.
- **Security rules:** Inherits the booking query restriction to the involved authenticated client, professional, or admin.
- **Feature flag:** Authenticated client dashboard gate.
- **Mockup references:** Client schedule/payment/change-request flow in `docs/mockups/IMPLEMENTATION_REFERENCE.md`, `docs/mockups/MASTER_MOCKUP.md`, and `docs/requirements/MASTER_SPECIFICATION.md` Part 7.
- **Parity requirement:** The client schedule must use the approved schedule hierarchy, grid treatment, status language, responsive behavior, and timezone presentation. Validate own bookings, anonymous locked-professional busy ranges, pending/accepted states, and privacy-safe unavailable states at desktop and mobile widths.
- **Verification:** Client current-week schedule entry in `docs/verification/VERIFICATION_LOG.md`.
- **Planned addition (Phase 9b):** implemented. `initializeClientSchedule` accepts an optional `lockedProfessional: {proId, displayName, busySlots}` parameter to render a locked professional's busy slots alongside the client's own bookings; rendering is unchanged when it is absent.
- **Timezone behavior:** week boundaries, booking matching, and locked busy-slot matching use the supplied IANA timezone. Date labels are formatted from the resulting ISO calendar date to avoid browser-local day shifts; the default is `Europe/Paris`.
- **Navigation behavior:** previous and next move by exactly seven calendar days in the supplied timezone; the current-week control returns to offset zero without reloading bookings or losing the locked-professional overlay.
- **Locked-slot booking:** when a professional is locked, available cells become explicit `Réserver` actions that navigate to `profile.html` with the professional, date, and start time preselected. Occupied anonymous cells remain non-interactive and expose no booking identity.
- **Duration rendering:** own bookings occupy each covered hourly cell in the selected week. The first cell shows the professional/status label and continuation cells keep the booked treatment without repeating private or identifying text.
