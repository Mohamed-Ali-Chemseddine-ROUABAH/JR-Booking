# Client history sharing

- **Production file:** `public/js/client-dashboard/client-history-share.js`
- **Purpose:** Renders consent-based history-share requests and invokes the authorized request, approve, and revoke callbacks.
- **Data/security:** Uses `clientRelationships`; approval grants read-only derived booking access and never booking mutation rights.
- **Verification:** `tests/client-relationships-emulator.test.cjs` covers consent and revocation boundaries.
