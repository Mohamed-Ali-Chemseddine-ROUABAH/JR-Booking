# Movement information module

- **Production file:** `public/js/pro-dashboard/movement-info.js`
- **Purpose:** Opens professional work-type and movement settings, stores private travel origin and distance bands, and displays a Leaflet map with optional geocoding.
- **Imports:** Firebase Firestore, `firebase-init.js`, and French UI strings; Leaflet is loaded by `pro-dashboard.html`.
- **DOM owner:** Creates and owns the movement settings modal; the professional navbar opens it through `pro-dashboard.js`.
- **Firestore/Storage:** Reads and writes `proProfiles/{proId}.movementInfo`, including online/movement toggles, private address, transportation visibility, and zone fee bands.
- **Security rules:** `proProfiles` remains readable and writable only by the owning professional or an admin. The address is never copied to `publicProfiles`.
- **Feature flag:** `movementInfo`, pending human verification.
- **Mockup references:** Movement zones, map, and transportation controls in `docs/requirements/MASTER_SPECIFICATION.md` Part 8.2.
- **Verification:** Phase 10 movement-settings implementation entry in `docs/verification/VERIFICATION_LOG.md`.
