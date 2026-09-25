# Client navbar architecture

- **Production file:** `public/js/client-dashboard/navbar-client.js`
- **Responsive behavior:** Matches the professional navbar pattern with a compact mobile `Menu` trigger that reveals account, print, settings, and logout actions without changing their permissions or callbacks.
- **Purpose:** Client dashboard navbar: brand mark, account email, print and notification actions, support action, logout, and a settings dropdown with profile editing, payment context, history sharing, and notification preferences.
- **Imports:** `UI_STRINGS.clientDashboard.navbar`.
- **DOM owner:** Creates and owns the navbar root markup passed to it; delegates profile editing to `client-profile-settings.js` through the `onEditProfile` callback.
- **Firestore:** None directly; reads only the already-authenticated `user` object for the displayed email.
- **Security rules:** None directly; gated by the page-level `requireAuth` call.
- **Mockup references:** Client dashboard navbar in `docs/requirements/MASTER_SPECIFICATION.md` Part 7.
