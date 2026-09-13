# Today widget toggle

- **Production file:** `public/js/pro-dashboard/today-widget-toggle.mjs`
- **Purpose:** Owns the empty Today widget's temporary hover and persistent click/tap/keyboard state machine.
- **Imports:** None.
- **DOM owner:** Enhances the `.today-widget.is-quiet` element rendered by `today-view.js`; it does not create markup.
- **Firestore/Storage:** None.
- **Security rules:** None; the module changes local classes and synchronized ARIA attributes only.
- **Feature flag:** Professional dashboard Today view.
- **Mockup references:** Compact Today widget in Master Specification Part 6.4 and `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** `tests/today-widget-toggle.test.mjs` and the Today view entry in `docs/verification/VERIFICATION_LOG.md`.