# Local testing

All scripts in this folder are local development helpers. They must only run against Firebase emulators and must never write to production services.

## Phase 2 test professional

Start the Auth emulator, then seed a local professional account:

```powershell
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"; $env:FIREBASE_PROJECT_ID = "jr-booking-premium"; node tests\seed-test-professional.js
```

Default emulator credentials:

- Email: `pro.test@jr-booking-premium.local`
- Password: set `TEST_PRO_PASSWORD` yourself, or use the randomly generated password printed by the seed helper.

## Phase 13 test admin

With the Auth emulator running, create or update a local admin claim:

```powershell
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"; node tests\seed-test-admin.js
```

Default admin credentials:

- Email: `admin.test@jr-booking-premium.local`
- Password: set `TEST_ADMIN_PASSWORD` yourself, or use the randomly generated password printed by the seed helper.

The helper sets `admin=true` and `role=admin` only in the local Auth emulator.

Optional overrides: `TEST_PRO_EMAIL`, `TEST_PRO_PASSWORD`, and `TEST_PRO_DISPLAY_NAME`.

The helper creates the Auth account in the local emulator. When no production web config has been injected, the browser maps `pro.test@jr-booking-premium.local` to the professional dashboard role only on `localhost` or `127.0.0.1`.

When you open auth pages on `http://127.0.0.1` or `http://localhost`, the browser automatically uses the local Firebase emulator config if no production web config has been injected.

## Booking contact tests

Run the pure validation tests without emulators:

```powershell
node --test tests\booking-contacts.test.cjs
```

With Auth, Firestore, and Functions emulators running, verify the trusted contact flow and booking rules:

```powershell
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"; $env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"; $env:FUNCTIONS_EMULATOR_HOST = "127.0.0.1:5001"; $env:FIREBASE_PROJECT_ID = "jr-booking-premium"; node --test tests\booking-contacts-emulator.test.cjs
```

The integration test creates disposable emulator-only Auth and Firestore records, verifies trusted create/update and audit behavior, checks that direct contact injection is denied, and removes its records afterward.

## Booking claim tests

Run the pure token and conflict-policy tests without emulators:

```powershell
node --test tests\booking-claims.test.cjs
```

With Auth, Firestore, and Functions emulators running, verify the complete trusted claim lifecycle:

```powershell
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"; $env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"; $env:FUNCTIONS_EMULATOR_HOST = "127.0.0.1:5001"; $env:FIREBASE_PROJECT_ID = "jr-booking-premium"; node --test tests\booking-claims-emulator.test.cjs
```

The integration test covers issuance, verified-email preview, failed-attempt revocation, acceptance, rejection, replay denial, expiry, unlinking, conflict review, sanitized admin conflict listing, admin resolution, and audit events. It refuses non-local emulator hosts and removes its disposable records afterward.

## Recurring booking scope tests

Run the deterministic scope-selection policy without emulators:

```powershell
node --test tests\booking-series.test.cjs
```

The policy covers `this`, `this-and-following`, and `all-in-series`, including non-series bookings, invalid targets/scopes, and malformed occurrence indexes.

With the local Auth, Firestore, and Functions emulators running, verify the trusted mutation and rules boundary:

```powershell
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"; $env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"; $env:FUNCTIONS_EMULATOR_HOST = "127.0.0.1:5001"; $env:FIREBASE_PROJECT_ID = "jr-booking-premium"; node --test tests\booking-series-emulator.test.cjs
```

The integration test seeds three occurrence documents, verifies isolated `this`, deterministic `this-and-following` and `all-in-series` selection, relative date/time preservation, idempotent retry, audit output, denial of direct series, mail, professional-application, and Storage writes, anonymous/unrelated booking read denial, professional operational-field allow-lists, authorized message-thread access, client cancellation, and denial of client-owned time mutation, then removes its emulator-only fixtures.

## Consent history-sharing relationship tests

With the local Auth and Firestore emulators running, verify the direct-write rules boundary for `clientRelationships` and the derived booking read access it grants:

```powershell
$env:FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"; $env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"; $env:FIREBASE_PROJECT_ID = "jr-booking-premium"; node --test tests\client-relationships-emulator.test.cjs
```

The integration test uses the Firestore REST API directly (not the Admin SDK, which bypasses rules) with real client ID tokens. It covers pre-consent read denial, rejection of self-targeting and UID-forging create attempts, denial of an outsider's read/act attempts, pending-state read denial, recipient-only approval, active-state read access, rejection of scope tampering, requester/recipient-only revocation with honest actor attribution, and post-revocation read denial, then removes its emulator-only fixtures.