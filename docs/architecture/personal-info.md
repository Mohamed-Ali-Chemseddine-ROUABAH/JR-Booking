# Personal-information settings architecture

- **Production file:** `public/js/pro-dashboard/personal-info.js`
- **Purpose:** Phase 6 modal for the professional's identity fields (name, unique `#id`, country, phone, address, student flag, SIRET, description), dashboard accent/header/text colors with reset, per-client links, CV-style experience entries, up to ten searchable categories, and a per-field public-visibility toggle.
- **Imports:** Firebase Firestore `getDoc`, `setDoc`, `serverTimestamp`, `getFirestoreDb`, and `UI_STRINGS.proDashboard.personalInfo`.
- **DOM owner:** Creates and owns its modal root, including form state and close behavior.
- **Firestore:** Reads and merges `proProfiles/{uid}.personalInfo` (private, full field set) and mirrors the public-facing subset into `publicProfiles/{uid}` (`displayName`, `name`, `idTag`, `categories`, `shortDescription`, `visibleFields`, `owners`, `updatedAt`) on save; the `#id` tag and categories are always mirrored, while `name` and `shortDescription` are only mirrored when their visibility toggle is on. Other private fields (country, phone, address, colors, links, experience, SIRET) stay in `proProfiles` only until a later phase renders them on the public profile.
- **Security rules:** `proProfiles/{proId}` requires ownership or admin; `publicProfiles/{proId}` update requires ownership and only the fields listed in `hasOnlyPublicProfileFields` (fixed in this change to also allow the `owners` array required by `willOwnProfile`/`ownsProfile`).
- **Feature flag:** Uses the existing professional dashboard gate.
- **Mockup references:** Pro settings and personal-information section in `docs/requirements/MASTER_SPECIFICATION.md` Part 6.
