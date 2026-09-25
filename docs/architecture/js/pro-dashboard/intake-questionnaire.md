# Intake questionnaire

- **Production file:** `public/js/pro-dashboard/intake-questionnaire.js`
- **Purpose:** Lets a professional configure up to ten first-booking questions with required/optional flags.
- **Firestore:** Reads/writes `proProfiles/{profileId}.intakeQuestionnaire.questions` and mirrors sanitized question text/required flags to `publicProfiles/{profileId}` for the public booking form.
- **Security rules:** Uses the existing owner/admin profile boundary; public mirrors expose only the explicitly public questionnaire configuration.
- **Client flow:** `profile-view.js` renders configured questions before booking submission and stores answers in the booking’s `intakeAnswers` field.
- **Mockup references:** Professional intake questionnaire and first-booking flow in Master Specification Parts 6.4 and 7.
- **Verification:** Configure required/optional questions, view them on the public profile, and verify booking submission preserves answers.
