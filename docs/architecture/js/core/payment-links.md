# Payment links

- **Production file:** `public/js/core/payment-links.js`
- **Purpose:** Normalizes legacy and current professional payment-link settings for authorized booking context display.
- **Data/security:** Reads already-authorized payment DTOs; it does not expose private professional payment data publicly or write transactions.
- **Verification:** `tests/payment-links.test.js` covers current and legacy link formats.
