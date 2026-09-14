# Cloud Functions architecture

- **Production file:** `functions/index.js`
- **Purpose:** Audit logging, immediate and daily-digest notifications, preference-aware booking-change and reminder delivery, Google Calendar integration, privileged account lifecycle, and trusted booking/contact/identity/delegation mutations.
- **Imports:** `firebase-admin`, `firebase-functions/v2/firestore`, and `firebase-functions/v2/https`.
- **DOM owner:** None.
- **Firestore/Storage:** Writes audit entries into `logs`; OAuth state is stored briefly in `calendarOAuthStates`; refresh tokens are stored only in `gcalTokens/{uid}`; provisioning and lifecycle functions update authorized profile records. Booking/contact/claim handlers own trusted identity mutations. Notification triggers resolve professional profile IDs to owner/delegate Auth UIDs. Delegation callables maintain bounded multi-profile claims and `listDelegatedBookings` returns a field allow-listed operational projection. `getBookingPrepNotes` and `updateBookingPrepNotes` own the private professional note document. `batchUpdateBookingStatus` validates up to 50 bookings before one atomic transaction.
- **Security rules:** `logs` denies all client writes; Admin SDK writes bypass rules as intended. Direct booking writes cannot add or alter contact, claim, series identity, or private-note fields. Delegates cannot read booking documents directly; the callable projection excludes client identity/contact/address/intake, payment, pricing, movement, and private-note data.
- **Feature flag:** None for audit logging; Calendar OAuth requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, and `GOOGLE_CALENDAR_SCOPES` deployment configuration.
- **Mockup references:** Calendar OAuth is prototype-only until Phase 14.
- **Verification:** Phase 3 syntax and emulator/deploy pipeline checks; `tests/notification-digest.test.cjs` covers the Paris-time digest window, calendar date, mixed-category digest formatting, and bounded mail content. Booking contact/claim suites cover identity boundaries. `tests/delegated-access-emulator.test.cjs` verifies sanitized projections, independent permissions, private-note denial, multi-profile removal, atomic batch behavior, and owner/delegate notification routing.
- `updateProfessionalBooking` also validates and transactionally applies the service snapshot, custom price, and client-facing message together with the existing contact, time-range, and recurring-series edits. Private preparation notes remain a separate owner-only operation.

## Final QA

`tests/run-local-tests.js` discovers the serial unit/emulator suites, syntax-checks Functions and browser modules, and verifies that every public JavaScript module has an architecture companion. It runs unit-only without emulator hosts and includes emulator tests automatically when all four local emulator host variables are present.

The runner also imports `tests/final-qa-audit.cjs` to enforce the local release-readiness contract: production module size, forbidden browser imports, secret-name exposure, and Firebase Hosting/Functions path integrity.