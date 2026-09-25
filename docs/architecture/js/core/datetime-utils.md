# Datetime utilities architecture

- **Production file:** `public/js/core/datetime-utils.mjs`
- **Purpose:** Converts timezone-local `datetime-local` form values to absolute ISO timestamps, converts stored timestamps back to local form values, and validates local date/time ranges.
- **Consumers:** Public profile booking and waitlist flow, client booking change flow, and professional booking creation/edit flows.
- **Security/data boundary:** This module performs deterministic client-side presentation and validation only. Trusted Functions and Firestore rules remain the authoritative booking authorization and field-validation boundary.
- **Timezone contract:** Callers provide the relevant professional or client IANA timezone; `Europe/Paris` is the application fallback.
- **Verification:** `tests/datetime-utils.test.mjs` covers Paris/New York conversion, round-tripping, and invalid local ranges.
