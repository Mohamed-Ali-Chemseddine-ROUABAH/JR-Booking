# Booking context menu architecture

- **Production files:** `public/js/pro-dashboard/booking-context-menu.js`, `public/js/schedule/schedule-render.js`
- **Purpose:** Provides the mockup-style right-click action menu for an authorized professional booking.
- **Actions:** Status actions reuse the existing Firestore handler; `Modifier` reuses the booking edit modal.
- **Privacy:** The menu is rendered only for booking cards already loaded for the authenticated professional.
- **Mockup references:** Schedule context menu and booking action menu in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and `docs/mockups/jr-booking-premium-mockup.html`.