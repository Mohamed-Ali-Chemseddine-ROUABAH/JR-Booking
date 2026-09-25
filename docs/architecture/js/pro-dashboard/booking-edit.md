# Professional booking edit

- **Production file:** `public/js/pro-dashboard/booking-edit.js`
- **Purpose:** Lets an authorized professional edit a booking's time range, contacts, service snapshot, custom price, client-facing message, and recurring-series scope.
- **Trusted boundary:** `updateProfessionalBooking` validates service name/duration/price, custom price, message length, ownership, request idempotency, and series scope before applying the change transactionally.
- **Private data:** preparation notes remain in the separate owner-only `bookings/{bookingId}/private/professional` callable flow and are not copied into the client-facing edit payload.
- **Datetime contract:** the edit form displays stored timestamps in the active professional timezone and converts edited local values to absolute ISO timestamps before `updateProfessionalBooking`.
- **Verification:** `tests/booking-update-validation.test.cjs` covers normalized valid fields and rejection of unsafe service and price values; `tests/booking-series.test.cjs` covers occurrence scope behavior.