# Database schema

This document tracks Firestore collections introduced by the roadmap. Security behavior lives in `firestore.rules`; this file names the intended document shapes.

## Phase 3 collections

### `publicProfiles/{proId}`

Public professional discovery document. Anonymous users may read this collection. Professionals may write only public profile fields and may not self-set `verified`.

Fields: `displayName`, `name`, `idTag`, `categories`, `shortDescription`, `visibleFields`, `avatarUrl`, `serviceArea`, `timezone`, `verified`, `updatedAt`, `owners`.

### `busySlots/{proId}/slots/{slotId}`

Anonymous-safe schedule mirror. Public readers see only unavailable time ranges.

Fields: `start`, `end`, `status`.

### `proProfiles/{proId}`

Private professional settings document, readable and writable by owners and admins only.

### `clientAccounts/{clientId}`

Client-owned account profile document.

Fields: `displayName`, `timezone`.

### `bookings/{bookingId}` and `bookings/{bookingId}/messages/{messageId}`

Reservation documents and reservation-linked messages. Access is limited to the involved client, professional, or admin.

### `mail/{messageId}`

Trigger Email extension queue. Authenticated users may create mail requests; admins may inspect them.

### `logs/{logId}`

Tamper-proof audit trail written by Cloud Functions only and readable by admins only.

### `gcalTokens/{proId}`

Calendar OAuth token store. Client access is always denied.

### Admin-support collections

`creationLinks`, `platformConfig`, `supportTickets`, and `dataRequests` are introduced for Phase 3 infrastructure and later admin tooling.