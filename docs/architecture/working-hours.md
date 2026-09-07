# Working-hours settings architecture

- **Production file:** `public/js/pro-dashboard/working-hours.js`
- **Purpose:** Phase 5 modal for weekly working days, daily hours, schedule day count, primary timezone, recurring break, date-specific exceptions, and repeatable absence periods.
- **Imports:** Firebase Firestore `getDoc`, `setDoc`, `getFirestoreDb`, and `UI_STRINGS.proDashboard.workingHours`.
- **DOM owner:** Creates and owns its modal root, including form state and close behavior.
- **Firestore:** Reads and merges `proProfiles/{uid}.workingHours`; no other fields are overwritten. The dashboard schedule reads the saved `viewDays`, `workingDays`, daily hours, and recurring break to render one to seven day columns with availability states.
- **Security rules:** `proProfiles/{proId}` read/update requires the authenticated professional to own the document or be an admin.
- **Feature flag:** Uses the existing professional dashboard gate; booking operations remain disabled.
- **Mockup references:** Pro settings, working-time configuration, and responsive dashboard behavior in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and `docs/requirements/MASTER_SPECIFICATION.md` Part 6.