# Client profile settings architecture

- **Production file:** `public/js/client-dashboard/client-profile-settings.js`
- **Purpose:** Client profile editor for display name, private movement address, and timezone, opened from the navbar's "Modifier mon profil" menu item.
- **Imports:** Firebase Firestore `getDoc`, `setDoc`, `getFirestoreDb`, and `UI_STRINGS.clientDashboard.profileSettings`.
- **DOM owner:** Creates and owns its modal root, appended to `document.body`, matching the `working-hours.js` modal pattern.
- **Firestore:** Reads and merges `clientAccounts/{uid}` (`displayName`, `address`, `timezone`). The address remains client-private and is used by booking-scoped movement pricing.
- **Security rules:** `clientAccounts/{clientId}` read/create/update requires the authenticated UID to match `clientId` or be an admin.
- **Mockup references:** Client dashboard "edit their own profile data" dropdown item in `docs/requirements/MASTER_SPECIFICATION.md` Part 7.
