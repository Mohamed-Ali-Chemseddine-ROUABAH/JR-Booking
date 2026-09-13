# Client database

## Purpose

Provides the professional-only CRM entry point for listing clients derived from the professional's bookings and editing profile-scoped rate and movement-surcharge overrides.

## Reads

- `bookings`, queried by `proId == currentUser.uid`.
- `proClientRecords/{proId}_{clientId}` for an existing override record.

## Writes

- `proClientRecords/{proId}_{clientId}` with `proId`, `clientId`, `customRate`, and `movementSurcharge`.

## Authorization

Firestore rules allow the owning professional to read, create, and update their own records. Admins retain read/update/delete access. The client database never exposes these records to clients or public visitors.

`relationshipStatus: "blocked"` prevents a client from creating a booking with this professional, while leaving other professionals unaffected. A professional can set the status back to `active`. `platformBanRequest` only records a pending escalation for a future admin workflow; it does not ban the account itself.

`eraseRequest` stores a professional-scoped erasure request with `status: "pending"`, the requesting professional, the request timestamp, and an ISO `scheduledFor` value 30 days later. The UI requires the exact French phrase `SUPPRIMER CE CLIENT`, keeps an invalid confirmation visible, and allows cancellation during the grace period. Historical bookings are not deleted by this request.

The client detail also derives up to fifteen recent booking and status events. The type and date filters are local to the authorized professional view. Status transitions append `{ status, at }` to `bookings.statusHistory`; older bookings without that field still show their current status as a fallback event. `Exporter PDF` opens a print-ready client report containing the identity and filtered history, allowing the browser's PDF destination to save it locally.

Booking update rules are role-scoped: clients may change only their own pending/active booking's status and requested time fields; professionals may update operational fields and sanitized payment/movement context; admins retain full access. Client status changes intentionally do not append professional `statusHistory` entries.

## UI behavior

The professional opens `Base clients` from the settings menu, filters the derived client list, opens one client, and saves overrides. Missing records are treated as empty on first edit. Block/unblock/ban escalation, typed erasure with grace period, action history, and local PDF export are available in the client detail flow.
