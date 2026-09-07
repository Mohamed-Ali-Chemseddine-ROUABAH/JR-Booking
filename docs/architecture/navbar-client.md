# Client navbar architecture

- **Production file:** `public/js/client-dashboard/navbar-client.js`
- **Purpose:** Client dashboard navbar: brand mark, account email, printer icon placeholder, logout, and a settings dropdown with "Modifier mon profil" and a disabled "Paiements" placeholder pending Phase 10.
- **Imports:** `UI_STRINGS.clientDashboard.navbar`.
- **DOM owner:** Creates and owns the navbar root markup passed to it; delegates profile editing to `client-profile-settings.js` through the `onEditProfile` callback.
- **Firestore:** None directly; reads only the already-authenticated `user` object for the displayed email.
- **Security rules:** None directly; gated by the page-level `requireAuth` call.
- **Mockup references:** Client dashboard navbar in `docs/requirements/MASTER_SPECIFICATION.md` Part 7.
