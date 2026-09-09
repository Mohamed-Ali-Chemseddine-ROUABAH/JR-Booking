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

The `paymentInfo` map contains `enabled`, `rib`, `bankTransfer`, `wero`, `weroPhone`, `ratePerUnit`, `banks`, `customBankName`, and `customBankUrl`. It remains private until a later client-booking context flow deliberately surfaces the relevant option for an active reservation.

The `movementInfo` map contains `online`, `movement`, `address`, `addressVisible`, `transportation`, `transportationVisible`, and `zones` (`min`, `max`, and `fee` per distance band). The address remains private; client-side distance and surcharge calculation is added only when client address data is available.

### `clientAccounts/{clientId}`

Client-owned account profile document.

Fields: `displayName`, `address`, `timezone`, `savedProfessionals`. The address is client-private and is used only when a booking involves professional movement. `savedProfessionals` is an array of `{proId, displayName, idTag}` entries the client chose to favorite (heart toggle) from the dashboard professional search; it uses the same owner-only read/update rule already in place and needed no `firestore.rules` change.

### `bookings/{bookingId}` and `bookings/{bookingId}/messages/{messageId}`

Reservation documents and reservation-linked messages. Access is limited to the involved client, professional, or admin. Client-created bookings may contain the client's own `clientAddress`; once the professional calculates movement, `movementQuote` contains only `distanceKm`, `travelMinutes`, the matched `zone`, and `surcharge`, never the professional's private origin or full movement settings. Active bookings may also contain a sanitized `paymentContext` with enabled payment options, `durationHours`, `ratePerUnit`, `surcharge`, and calculated `balance`; it never grants clients access to `proProfiles`.

### `mail/{messageId}`

Trigger Email extension queue. Authenticated users may create mail requests; admins may inspect them.

### `logs/{logId}`

Tamper-proof audit trail written by Cloud Functions only and readable by admins only.

### `gcalTokens/{proId}`

Calendar OAuth token store. Client access is always denied.

### Admin-support collections

`creationLinks`, `platformConfig`, `supportTickets`, and `dataRequests` are introduced for Phase 3 infrastructure and later admin tooling.