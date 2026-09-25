# Category search utilities

- **Production file:** `public/js/search/category-search-utils.mjs`
- **Purpose:** Normalizes category queries and matches public profiles across accents and case.
- **Data/security:** Pure functions over public-profile DTOs; no private profile or booking data.
- **Verification:** `tests/category-search.test.mjs` covers normalization and matching.
