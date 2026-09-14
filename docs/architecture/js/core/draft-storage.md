# Draft storage

- **Production file:** `public/js/core/draft-storage.mjs`
- **Purpose:** Safely saves, restores, and clears JSON form drafts in browser storage.
- **Privacy boundary:** callers choose the fields and must not store credentials, payment secrets, private addresses, or client records. Working-hours settings are the first consumer.
- **Failure behavior:** storage quota errors and malformed JSON return safe failure/null values so forms continue working.
- **Verification:** `tests/draft-storage.test.mjs` covers round-trip, clearing, and malformed-data handling.