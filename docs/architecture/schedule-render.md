# Schedule renderer architecture

- **Production file:** `public/js/schedule/schedule-render.js`
- **Purpose:** Renders the professional schedule with date navigation, one/three/seven-day views, working-time availability, and the professional's authorized booking cards.
- **Responsive layout:** The time column and every selected day share the schedule panel's available width. Day tracks use a zero intrinsic minimum so the seven-day view remains fully visible when the professional sidebar is open, without horizontal dragging. Day headings, times, availability labels, and booking text are centered within their cells.
- **Imports:** `UI_STRINGS` only; booking data is supplied by the protected dashboard initializer.
- **Firestore:** The module does not query Firestore directly. `pro-dashboard.js` queries `bookings` by `proId` and passes role-authorized DTOs.
- **Drag-to-select:** A `mousedown` on an available slot followed by moving the pointer into another slot in the same day column previews a contiguous multi-hour selection (`schedule-slot-drag-preview`); the range stops extending at the first booked or unavailable hour so a drag can never span a conflict. Releasing the pointer over more than one hour calls `onCreateBooking` with the computed `date`, `hour`, and `endHour`; a plain click or double-click on a single slot keeps its existing behavior.
- **Security rules:** Booking reads are limited by `firestore.rules` to the involved professional, client, or admin; rejected bookings are not rendered.
- **Mockup references:** Pro schedule grid, booking states, date navigation, and schedule view switcher in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and `docs/mockups/jr-booking-premium-mockup.html`.