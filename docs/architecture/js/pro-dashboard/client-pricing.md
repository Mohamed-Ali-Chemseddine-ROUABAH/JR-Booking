# Client pricing overrides

- **Production file:** `public/js/pro-dashboard/client-pricing.mjs`
- **Purpose:** Resolves bounded per-client rate and movement-surcharge overrides against professional defaults.
- **Data/security:** Operates on authorized CRM and booking DTOs; private CRM records remain profile-scoped.
- **Verification:** `tests/client-pricing.test.mjs` covers valid, empty, and invalid overrides.
