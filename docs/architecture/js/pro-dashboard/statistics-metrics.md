# Statistics metric helpers

- **Production file:** `public/js/pro-dashboard/statistics-metrics.mjs`
- **Purpose:** Computes occupancy, retention, trend, category, revenue, activity filtering, and reporting highlights from authorized booking DTOs.
- **Data/security:** Read-side calculations only; resolved prices are never trusted from a client-writable aggregate.
- **Verification:** `tests/statistics-metrics.test.mjs` covers the metric and completed-activity reporting contracts.
