# Email-link utilities

- **Production file:** `public/js/core/email-link-utils.mjs`
- **Purpose:** Normalizes and validates Firebase email-link redirect parameters.
- **Data/security:** Stores only temporary sign-in handoff state and never creates a parallel credential or token system.
- **Verification:** `tests/email-link-utils.test.mjs` covers valid and malformed link state.
