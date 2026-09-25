# Booking contacts architecture

- **Production file:** `public/js/pro-dashboard/booking-contacts.js`
- **Purpose:** Renders the reusable professional booking-contact editor for create and edit flows. It keeps one non-removable primary contact and allows up to nine guardian, payer, participant, or assistant contacts with independent notification toggles.
- **Trusted writes:** The module returns form input only. `createProfessionalBooking` and `updateProfessionalBooking` normalize and validate the complete contact set, assign stable contact IDs, preserve server-owned verification links when identity is unchanged, and write contact audit events.
- **Security:** The browser never supplies `linkedUid`, `verifiedAt`, claim state, or series identity. Firestore rules reject direct booking writes containing contact or claim fields.
- **Privacy:** Contact emails appear only in authenticated professional booking tools and are never used as Firestore read authorization.