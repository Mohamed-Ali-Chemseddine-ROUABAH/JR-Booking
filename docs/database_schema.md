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

Message fields: `authorUid`, `authorRole`, `body`, `createdAt`, `editedAt`, `readAt`, and optional `notificationState` (`not-requested`, `queued`, `sent`, `failed`). Messages are never writable by anonymous users, unrelated clients, or a delegate without the explicit messaging permission. The message is saved independently from email delivery.

Booking identity fields planned for the reservation-linking slice: `clientId` (nullable until a verified account claims the booking), `serviceRecipientUid` (nullable and distinct from the contact or payer), `contacts` (small capped array of `{contactId, email, role, verifiedAt, linkedUid, notify}`), `claimState`, `claimExpiresAt`, and optional `claimConflict`. Contact emails are notification routes, not account ownership. The server normalizes and validates them; clients and professionals cannot use an arbitrary email string to read another person's bookings.

Recurring or linked bookings store `seriesId` and `occurrenceIndex`; a modification records `seriesScope` (`this`, `this-and-following`, or `all-in-series`), actor, timestamp, previous values, and affected booking IDs. Each occurrence is a separate booking document. The operation is transactional or idempotent so a partial series update can be retried safely without duplicating occurrences.

### `clientRelationships/{relationshipId}`

Explicit consent record for sharing client history or delegated booking visibility. Fields: `requesterUid`, `recipientUid`, `scope` (`booking`, `professional`, `all`), optional `proId`, `status` (`pending`, `active`, `revoked`, `expired`), `requestedAt`, `acceptedAt`, `revokedAt`, and `updatedAt`. Both users must approve before access is active; revocation affects future reads without deleting historical bookings.

### `clientAccounts/{clientId}.authSettings`

Private authentication and consent metadata only; never store passwords or email-link tokens here. Fields may include `passwordAuthEnabled`, `emailLinkEnabled`, `termsVersion`, `termsAcceptedAt`, `privacyVersion`, `privacyAcceptedAt`, `emailLinkLastRequestedAt`, and `recoveryMethod`. Firebase Auth owns credentials, email-link expiry, and session revocation; rate limits and replay protection remain server/provider responsibilities.

### `notificationPreferences/{uid}`

Private user-owned delivery preferences. Fields: `messageEmail` (`immediate`, `daily`, `none`), `bookingEmail` (`immediate`, `none`), `reminderEmail` (`immediate`, `none`), `timezone`, and `updatedAt`. Security rules allow only the owner or an admin to read or update this document. Security and essential transaction emails ignore opt-out preferences where legally or operationally required.

### `mail/{messageId}`

Trigger Email extension queue. Only trusted server-side functions create system and notification mail requests; clients cannot create arbitrary mail documents. Admins may inspect safe delivery metadata.

Mail fields are normalized by the server: `to`, `message.subject`, `message.text`, `message.html`, `templateId`, `category`, `sourceId`, `createdAt`, and safe delivery metadata written by the extension. The queue never stores SMTP credentials, Gmail passwords, OAuth refresh tokens, or arbitrary user-supplied sender addresses.

For the email-first professional application, server-side Functions create these documents after the application or approval transaction succeeds. The document must contain the recipient, a subject, and the provider-specific message fields configured by the installed Trigger Email extension. The application UI reports `email queued` only after this write succeeds; actual delivery is verified separately by the extension's processed status and a real test mailbox.

### `professionalRequests/{applicationId}`

Publicly initiated professional application. The application ID is generated by the trusted submission boundary and is not the applicant's Auth UID.

Fields: `email`, `displayName`, `description`, `verificationFile` (`name`, `contentType`, `size`, `storagePath`), `emailVerificationStatus`, `status` (`awaiting-email-verification`, `pending-review`, `approved-awaiting-password`, `rejected`, `completed`, `expired`), `verificationTokenHash` (server-only), `verificationExpiresAt`, `passwordSetupExpiresAt`, `reviewedBy`, `reviewedAt`, `decisionReason`, `createdAt`, and `updatedAt`. The Firebase Auth UID is added only during approval/provisioning and is not the public application ID.

Anonymous clients may submit only through the trusted boundary and may not read the document. Admins may read and update the full application. The trusted boundary, not the browser, writes the application document and verification-file metadata. Tokens are never returned in ordinary Firestore reads. The current authenticated-owner Firestore rule is therefore a legacy rule to replace before this lifecycle is implemented.

### `professionalRequestEvents/{eventId}`

Server-written audit events for submission, email verification, admin decision, provisioning, password setup, expiration, and delivery failure. Fields: `applicationId`, `type`, `at`, `actorUid` where applicable, `outcome`, and safe metadata. Applicants cannot read this collection.

### `logs/{logId}`

Tamper-proof audit trail written by Cloud Functions only and readable by admins only.

### `gcalTokens/{proId}`

Calendar OAuth token store. Client access is always denied.

### Admin-support collections

`creationLinks`, `platformConfig`, `supportTickets`, and `dataRequests` are introduced for Phase 3 infrastructure and later admin tooling.