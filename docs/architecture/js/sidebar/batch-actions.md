# Batch booking actions

- **Production file:** `public/js/sidebar/batch-actions.js`
- **Purpose:** Applies one accepted or rejected status to several pending bookings selected in the professional sidebar.
- **Imports:** `core/strings-fr.js` only.
- **DOM owner:** None; it validates selection/confirmation and delegates persistence to the callback supplied by `sidebar-feed.js`.
- **Firestore/Storage:** The dashboard callback invokes `batchUpdateBookingStatus`; the callable validates every booking and commits all updates in one Firestore transaction. No Storage access.
- **Security rules:** The trusted callable requires profile ownership, admin status, or active `manageBookings` permission for every booking. Any invalid/unauthorized item aborts the complete batch.
- **UI:** The pending filter renders select-all, per-booking checkboxes, selection count, and accept/reject controls. Controls remain hidden for accepted/rejected filters.
- **Feature flag:** Professional booking operations.
- **Mockup reference:** Professional sidebar batch-action selection and confirmation in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and Master Specification Part 6.1/6.4.
- **Verification:** Professional batch booking actions entry in `docs/verification/VERIFICATION_LOG.md`; atomic behavior is covered by `tests/delegated-access-emulator.test.cjs`.
