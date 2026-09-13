# Booking claim architecture

- **Production files:** `public/claim-booking.html`, `public/js/client-dashboard/booking-claim.js`.
- **Purpose:** Presents one specifically identified professional-created booking to the authenticated verified-email recipient and lets that person accept or reject the link.
- **Authentication:** Firebase email/password remains the baseline. An unauthenticated visitor is sent to `login.html?returnTo=claim-booking.html`; the booking ID and raw token remain in same-origin session storage for the return. The trusted Function also verifies Firebase Auth email ownership.
- **Trusted operations:** `previewBookingClaim` returns only sanitized booking context. `resolveBookingClaim` consumes the single-use token and records claim, rejection, or safe conflict state. The browser never reads `bookingClaimTokens`.
- **Recovery interfaces:** A claimed client booking card exposes a distinct `Délier de mon compte` action with an explicit history-preservation confirmation. The admin dashboard lists sanitized unresolved conflicts through `listBookingClaimConflicts` and invokes `resolveBookingClaimConflict` to approve or deny them; requester identity remains in the server-only token document.
- **Privacy:** The page exposes no booking until authenticated UID, verified email, token hash, booking ID, expiry, usage state, and contact match all pass server validation.