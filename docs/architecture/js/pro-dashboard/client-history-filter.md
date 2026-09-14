# Client history filter

- **Production file:** `public/js/pro-dashboard/client-history-filter.mjs`
- **Purpose:** Filters CRM history by event type and the active professional timezone without importing Firebase or touching private data.
- **Reads/writes:** None; it receives already-authorized history DTOs and returns a filtered array.
- **Consumers:** `public/js/pro-dashboard/client-database.js`.
- **Verification:** `tests/client-history-filter.test.mjs` covers timezone-boundary dates and combined type/date filtering.