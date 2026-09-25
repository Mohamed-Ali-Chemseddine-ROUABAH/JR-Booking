# Admin login route

- **Production file:** `public/js/admin/admin-login-route.mjs`
- **Purpose:** Resolves the configured unguessable admin route and redirects unexpected filenames safely.
- **Data/security:** Reads the browser path and configured route token only; authentication remains enforced by the admin dashboard guard.
- **Verification:** `tests/admin-login-route.test.mjs` covers route normalization and redirect targets.
