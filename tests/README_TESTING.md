# Local testing

All scripts in this folder are local development helpers. They must only run against Firebase emulators and must never write to production services.

## Phase 2 test professional

Start the Auth emulator, then seed a local professional account:

```powershell
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"; $env:FIREBASE_PROJECT_ID = "jr-booking-premium"; node tests\seed-test-professional.js
```

Default emulator credentials:

- Email: `pro.test@jr-booking-premium.local`
- Password: `ChangeMe123!`

Optional overrides: `TEST_PRO_EMAIL`, `TEST_PRO_PASSWORD`, and `TEST_PRO_DISPLAY_NAME`.

The helper creates the Auth account in the local emulator. When no production web config has been injected, the browser maps `pro.test@jr-booking-premium.local` to the professional dashboard role only on `localhost` or `127.0.0.1`.

When you open auth pages on `http://127.0.0.1` or `http://localhost`, the browser automatically uses the local Firebase emulator config if no production web config has been injected.