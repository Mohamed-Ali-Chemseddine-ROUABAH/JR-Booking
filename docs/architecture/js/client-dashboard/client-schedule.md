# Client schedule architecture

- **Production file:** `public/js/client-dashboard/client-schedule.js`
- **Purpose:** Renders the client's read-only current-week schedule from the client's own bookings using the persisted client timezone, with the same schedule-head hierarchy and dashboard panel treatment as the professional schedule.
- **Imports:** `strings-fr.js` and `escapeHtml` from `core/utils.js`.
- **DOM owner:** Owns the `data-client-schedule-root` region in `client-dashboard.html`.
- **Firestore/Storage:** No direct reads; `client-dashboard.js` supplies authorized bookings and the saved `clientAccounts/{uid}.timezone` value.
- **Security rules:** Inherits the booking query restriction to the involved authenticated client, professional, or admin.
- **Feature flag:** Authenticated client dashboard gate.
- **Mockup references:** Client schedule/payment/change-request flow in `docs/requirements/MASTER_SPECIFICATION.md` Part 7.
- **Verification:** Client current-week schedule entry in `docs/verification/VERIFICATION_LOG.md`.
- **Planned addition (Phase 9b):** implemented. `initializeClientSchedule` accepts an optional `lockedProfessional: {proId, displayName, busySlots}` parameter to render a locked professional's busy slots alongside the client's own bookings; rendering is unchanged when it is absent.
- **Timezone behavior:** week boundaries, booking matching, and locked busy-slot matching use the supplied IANA timezone. Date labels are formatted from the resulting ISO calendar date to avoid browser-local day shifts; the default is `Europe/Paris`.
