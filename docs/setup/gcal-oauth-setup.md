# Google Calendar OAuth setup

## Prerequisites

- Complete setup checklist items 1-8 and 11.
- Use a Firebase project linked to the local `.firebaserc` project ID.
- Use a dedicated Google Cloud OAuth client for local/sandbox verification before production.

## Google Cloud Console

1. Open Google Cloud Console for the Firebase project.
2. Enable the Google Calendar API.
3. Configure the OAuth consent screen with the minimum Calendar scopes required by the future sync implementation.
4. Create a Web application OAuth client.
5. Add the approved redirect URI:
   `https://jr-booking-premium.web.app/api/calendar/google/callback`
6. Add a localhost callback for emulator/sandbox testing only when the Google Cloud console permits it.

Never commit the client secret. Store it in Firebase Secret Manager for Functions. The redirect URI is non-secret and may be recorded in `.env.example`. The template also declares `GOOGLE_CLIENT_ID` and `GOOGLE_CALENDAR_SCOPES`; replace the client ID only in the local/deployment environment.

## Local verification

- Start Auth, Firestore, Functions, and Hosting emulators together when testing the complete callback path.
- Confirm the Functions emulator exposes `calendarAuthCallback`.
- Confirm the Hosting rewrite `/api/calendar/google/callback` resolves to that function.
- Use a dedicated sandbox Google account and revoke the grant after testing.

## Current implementation boundary

The professional dashboard currently stores `proProfiles/{proId}.calendarSettings.mode` (`ghost` or `solid`) and `reminderMinutes`. The OAuth callback and callable authorization path are implemented, but remain unavailable until the human supplies the Google Cloud OAuth client and the secret is stored securely. Event import/export and webhook processing remain subsequent slices.

The OAuth code path is now implemented. Deploy Functions with:

- `GOOGLE_CLIENT_ID` as a non-secret deployment parameter;
- `GOOGLE_CALENDAR_SCOPES=https://www.googleapis.com/auth/calendar.events`;
- `GOOGLE_REDIRECT_URI=https://jr-booking-premium.web.app/api/calendar/google/callback`;
- `GOOGLE_CLIENT_SECRET` bound from Firebase Secret Manager.

For non-interactive Firebase deploys, the non-secret parameters are kept in the ignored `functions/.env` file. The Client Secret is not stored there; it remains in Secret Manager.

The callable `getGoogleCalendarAuthUrl` creates a short-lived single-use state tied to the authenticated professional. The callback validates and deletes that state, exchanges the code server-side, and stores only the refresh token in `gcalTokens/{proId}`. The browser never receives the client secret or refresh token.

The OAuth Functions were deployed selectively so existing Functions in the Firebase project that are not present in this repository were not deleted. The deployed callback is `https://us-central1-jr-booking-premium.cloudfunctions.net/calendarAuthCallback`, with Hosting routing `/api/calendar/google/callback` to it.

## Production dependencies

- `public/js/schedule/schedule-gcal-sync.js`
- `public/js/schedule/schedule-render.js`
- `functions/index.js`
- `firebase.json` Hosting rewrite
