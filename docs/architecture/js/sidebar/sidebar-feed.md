# Professional sidebar feed

- **Production file:** `public/js/sidebar/sidebar-feed.js`
- **Purpose:** Renders filtered pending/accepted/rejected booking cards, batch selection, and booking action callbacks.
- **Data/security:** Receives profile-authorized booking DTOs; delegates receive only callback actions allowed by their permissions.
- **Verification:** Batch actions, notification routing, and populated sidebar behavior are recorded in `VERIFICATION_LOG.md`.
