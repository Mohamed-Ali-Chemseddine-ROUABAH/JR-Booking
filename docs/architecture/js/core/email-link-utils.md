# Email-link utilities

- **Production file:** `public/js/core/email-link-utils.mjs`
- **Purpose:** Normalizes Firebase email addresses and builds/validates same-origin auth continuations, including allowlisted public-profile booking selection fields.
- **Data/security:** A booking continuation carries only public profile ID, service index, date, and start time. It rejects foreign origins, duplicate or unknown query fields, malformed dates/times, and profile IDs with path separators. It never carries credentials, email addresses, intake answers, Auth UIDs, or booking identity.
- **Verification:** `tests/email-link-utils.test.mjs` covers same-origin continuations, slot parameter validation, duplicate/unknown field rejection, and open-redirect denial.
