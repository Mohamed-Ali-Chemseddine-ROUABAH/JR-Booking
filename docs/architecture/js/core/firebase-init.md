# Firebase initialization architecture

- **Production file:** `public/js/core/firebase-init.js`
- **Purpose:** Lazily initialize the browser Firebase app from `window.JR_BOOKING_FIREBASE_CONFIG` and expose Firestore/Auth clients to phase modules.
- **Imports:** Firebase App, Auth, and Firestore browser modules from the pinned CDN version.
- **DOM owner:** None.
- **Firestore/Storage:** Creates Firestore and Auth clients only when a complete public web config is supplied.
- **Local emulator behavior:** On `localhost`, `127.0.0.1`, or `::1`, the browser uses a fake local Firebase config and connects Auth to `127.0.0.1:9099` plus Firestore to `127.0.0.1:8080` when no real `window.JR_BOOKING_FIREBASE_CONFIG` is present. A local page can override this with `window.JR_BOOKING_EMULATORS = { auth: true, firestore: { host: "127.0.0.1", port: 8080 } }` before importing app modules. Production pages must leave emulator config unset. `isUsingLocalFirebaseEmulators()` exposes this local-only mode to auth guards.
- **Security rules:** No rule changes here; Phase 2 uses Firebase Authentication and Phase 3 adds Firestore rules.
- **Feature flag:** None.
- **Mockup references:** Auth shell behavior in `docs/mockups/IMPLEMENTATION_REFERENCE.md` through `auth-guard.js`.
- **Verification:** Phase 1 self-check, Phase 2 auth checks, and Phase 3 security verification.
