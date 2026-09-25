# Public schedule security

- **Rules owner:** `firestore.rules` public profile validation.
- **Purpose:** Constrains the public `scheduleAvailability` projection to safe working-day, time, and bounded schedule-setting fields.
- **Privacy boundary:** the public projection cannot contain addresses, absence reasons, payment data, client data, or arbitrary nested fields.
- **Authorization:** only the owning professional or an admin can write the public profile; anonymous users retain read-only access.
- **Verification:** Firestore emulator initialization validates the rules file after the nested allow-list was added.