# Landing page architecture

- **Production file:** `public/index.html`
- **Purpose:** Public landing page and entry point for professional/category discovery.
- **Imports:** `public/js/core/strings-fr.js`, `public/js/search/search-professional.js`, `public/js/shared/notifications.js`.
- **DOM owner:** The page owns the landing shell and search form; the search module owns search results when that surface is added.
- **Firestore/Storage:** Reads `publicProfiles` through the search module when a Firebase web configuration is present. No writes.
- **Security rules:** Phase 1 keeps Firestore default-deny. Public profile reads will be enabled only with the Phase 3 public-field rules.
- **Feature flag:** `publicSearchAndSchedule`, off until its verification entry passes.
- **Mockup references:** Landing search in `docs/mockups/IMPLEMENTATION_REFERENCE.md`; visual tokens in `docs/mockups/MASTER_MOCKUP.md`.
- **Verification:** Shared UI foundation and public discovery preparation entries in `docs/verification/VERIFICATION_LOG.md`.
