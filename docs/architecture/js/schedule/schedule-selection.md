# Fixed-slot selection

- **Production file:** `public/js/schedule/schedule-selection.mjs`
- **Purpose:** Maintains bounded same-day fixed-slot selections and converts them into one booking range.
- **Privacy/data:** Pure in-memory UI state; no Firestore access or client data.
- **Consumer:** `public/js/schedule/schedule-render.js`.
- **Verification:** `tests/schedule-selection.test.mjs` covers same-day limits, maximum selection count, and duration aggregation.