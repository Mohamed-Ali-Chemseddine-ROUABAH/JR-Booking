# Booking movement pricing module

- **Production file:** `public/js/pro-dashboard/movement-pricing.js`
- **Purpose:** Geocodes the professional origin and client destination, requests a route estimate, matches the distance to a configured movement zone, and returns a booking-scoped quote.
- **Imports:** None; uses OpenStreetMap Nominatim and OSRM HTTP APIs.
- **DOM owner:** No direct DOM; `pro-dashboard.js` invokes it while loading professional bookings.
- **Firestore/Storage:** No direct reads or writes. The caller stores the returned `movementQuote` on the involved booking.
- **Security rules:** The professional reads its own private movement settings; clients never read `proProfiles`. The booking shares only `distanceKm`, `travelMinutes`, `zone`, and `surcharge`.
- **Feature flag:** `movementPricing`, AI authenticated browser smoke test passed; human verification remains pending.
- **Mockup references:** Movement-zone surcharge and travel estimate requirements in `docs/requirements/MASTER_SPECIFICATION.md` Part 8.2.
- **Verification:** Phase 10 booking-scoped movement quote entry in `docs/verification/VERIFICATION_LOG.md`.
