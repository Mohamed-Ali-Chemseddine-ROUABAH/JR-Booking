# Category search

- **Production file:** `public/js/search/search-category.js`
- **Purpose:** Loads public profiles and returns category-matched discovery results.
- **Data/security:** Reads only the intentionally public `publicProfiles` collection and limits result volume.
- **Verification:** `tests/category-search.test.mjs` covers category behavior.
