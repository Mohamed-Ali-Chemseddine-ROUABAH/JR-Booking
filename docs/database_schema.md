# Database schema

This document tracks Firestore collections introduced by the roadmap. Security behavior lives in `firestore.rules`; this file names the intended document shapes.

## Phase 3 collections

### `publicProfiles/{proId}`

Public professional discovery document. Anonymous users may read this collection. Professionals may write only public profile fields and may not self-set `verified`.

Fields: `displayName`, `name`, `idTag`, `categories`, `services`, `shortDescription`, `visibleFields`, `avatarUrl`, `serviceArea`, `timezone`, `verified`, `updatedAt`, `owners`. `services` contains sanitized `{name, durationMinutes, price}` entries selected by professionals for public booking.

### `busySlots/{proId}/slots/{slotId}`

Anonymous-safe schedule mirror. Public readers see only unavailable time ranges.

Fields: `start`, `end`, `status`.

### `proProfiles/{proId}`

Private professional settings document, readable and writable by owners and admins only.

The `workingHours.bufferMinutes` field reserves a configurable 0-120 minute gap before and after accepted or pending bookings. The schedule renders buffered cells unavailable; it does not alter booking timestamps.

The `paymentInfo` map contains `enabled`, `rib`, `bankTransfer`, `wero`, `weroPhone`, `ratePerUnit`, `banks`, `customBankName`, and `customBankUrl`. It remains private until a later client-booking context flow deliberately surfaces the relevant option for an active reservation.

The `movementInfo` map contains `online`, `movement`, `address`, `addressVisible`, `transportation`, `transportationVisible`, and `zones` (`min`, `max`, and `fee` per distance band). The address remains private; client-side distance and surcharge calculation is added only when client address data is available.

The `quickReplies` array contains up to twenty private reusable message templates with `{label, body}` fields. Templates are read only by profile owners or administrators and are never mirrored to public profiles or client documents.

The `delegates` map is keyed by an existing Auth UID. Each entry contains `email`, `displayName`, `permissions` (`manageBookings` and/or `manageMessages`), `status`, `addedAt`, and `updatedAt`. Delegates are profile-scoped and never become owners; sensitive profile settings and private preparation notes remain owner-only.

### `clientAccounts/{clientId}`

Client-owned account profile document.

Fields: `displayName`, `address`, `timezone`, `savedProfessionals`. The address is client-private and is used only when a booking involves professional movement. `savedProfessionals` is an array of `{proId, displayName, idTag}` entries the client chose to favorite (heart toggle) from the dashboard professional search; it uses the same owner-only read/update rule already in place and needed no `firestore.rules` change.

### `bookings/{bookingId}`, `bookings/{bookingId}/messages/{messageId}`, and `bookings/{bookingId}/private/professional`

Reservation documents and reservation-linked messages. Access is limited to the involved client, professional, or admin. Client-created bookings require `request.auth.token.email_verified == true` and include a `clientEmail` snapshot equal to the authenticated token email; `clientId` and `createdBy` remain bound to that Auth UID. This lets the professional identify the verified requester without reading `clientAccounts/{clientId}`. Client-created bookings may also contain the client's own `clientAddress` and an optional immutable-at-creation `service` snapshot with `name`, `durationMinutes`, and `price`; once the professional calculates movement, `movementQuote` contains only `distanceKm`, `travelMinutes`, the matched `zone`, and `surcharge`, never the professional's private origin or full movement settings. Active bookings may also contain a sanitized `paymentContext` with enabled payment options, `durationHours`, `ratePerUnit`, `surcharge`, and calculated `balance`; it never grants clients access to `proProfiles`.

Message fields: `senderUid`, `senderRole`, `body`, `createdAt`, `notificationStatus` (`pending`, `not-requested`, `queued`, `sent`, `failed`), and optional `mailId`. Messages are created through the trusted `sendBookingMessage` callable; the browser can only read an authorized thread. The message is saved independently from email delivery.

Private preparation notes are never fields on `bookings/{bookingId}`. The owner/admin-only `bookings/{bookingId}/private/professional` document stores `prepNotes` (maximum 2000 characters), `updatedAt`, and `updatedBy`. Trusted callable functions read and update it; client and delegate reads are denied.

Booking identity fields planned for the reservation-linking slice: `clientId` (nullable until the primary contact claims the booking), `serviceRecipientUid` (nullable until the participant claims it), and `contacts`. `contacts` is capped at ten entries, contains exactly one active primary contact, and uses `{contactId, email, role, notify, verifiedAt, linkedUid}`. `role` is one of `primary`, `guardian`, `payer`, `participant`, or `assistant`; email is normalized lowercase; `notify` is Boolean; and the server alone sets the nullable `verifiedAt` and `linkedUid`. Duplicate normalized email/role pairs are rejected. Contact emails are notification routes, not account ownership.

Claim metadata uses `claimState` (`unclaimed`, `pending`, `claimed`, `review-required`, `rejected`, `expired`, or `unlinked`), nullable `claimExpiresAt`, and optional safe `claimConflict` containing only `{reasonCode, createdAt, resolvedAt, resolution}`. Sensitive requester or competing-account details stay in admin-only audit data. Claim tokens and their hashes never appear on a booking document.

Recurring bookings store a stable `seriesId` and zero-based `occurrenceIndex`; each occurrence is a separate booking document. `seriesScope` (`this`, `this-and-following`, or `all-in-series`) is an operation input and audit value, not durable state copied onto every occurrence. The selected target receives the requested date/time range; other selected occurrences preserve their relative date/time offset and receive the requested duration. A server-written `logs` event records the actor, timestamp, requested scope, previous values, and affected booking IDs. The mutation uses an idempotency key and a deterministic occurrence set so a retry cannot duplicate or skip occurrences.

New-field rule allow-list for this slice:

- Direct professional creates and updates must omit `contacts`, `seriesId`, `occurrenceIndex`, `serviceRecipientUid`, `claimState`, `claimExpiresAt`, and `claimConflict`; guest-contact creation, contact add/update/remove, and recurring-series creation or modification use trusted handlers. This prevents replacement of the contact array from erasing server-owned verification links and prevents direct changes to series membership.
- A client-created booking may set `clientId` only to `request.auth.uid` on create and may include `clientEmail` only when it exactly matches the verified Auth token email. It must omit every other identity, contact, claim, and series field. Direct client updates may not change `contacts`, `clientId`, `clientEmail`, `serviceRecipientUid`, `seriesId`, `occurrenceIndex`, `claimState`, `claimExpiresAt`, or `claimConflict`.
- Client-created bookings additionally require `request.auth.token.email_verified == true`; `clientEmail` must exactly equal `request.auth.token.email`, and `clientId`/`createdBy` must both equal the caller UID. Verified email-link sessions are accepted; no sign-in-provider restriction is applied.
- Only trusted server code may change contact routing, identity links, verification fields, claim metadata, series identity, or multiple occurrences in one series operation. Admin access remains explicit and does not convert these fields into ordinary client-writable fields.
- `clientRelationships` permits the requester to create a `pending` record, the named recipient to approve it, and either named user to revoke it. Neither party may change the two UIDs or broaden the scope after creation.
- `bookingClaimTokens`, `legalAcceptances`, and `logs` deny all direct client writes. Rules must use key allow-lists (`affectedKeys().hasOnly(...)`) and value/type checks for every permitted transition.

### `waitlistEntries/{proId}/entries/{entryId}`

Trusted waitlist enrollment records a client's requested professional/time window with `clientId`, `proId`, `start`, `end`, `status`, `notified`, `createdAt`, and optional `notifiedAt`. Clients join through `joinBookingWaitlist`; direct browser writes are denied. The owning professional or the client can read an entry, while notification processing remains server-side.

### `clientRelationships/{relationshipId}`

Explicit consent record for sharing client history or delegated booking visibility. The document ID is deterministic: the two participant UIDs sorted lexicographically, joined with the `scope` and scope identifier (`bookingId`, `proId`, or `all`), so security rules can look up an existing grant with `get()`/`exists()` without a query. Fields: `requesterUid`, `recipientUid`, `scope` (`booking`, `professional`, `all`), `bookingId` when scope is `booking`, `proId` when scope is `professional`, `status` (`pending`, `active`, `revoked`, `expired`), `requestedAt`, `acceptedAt`, `revokedAt`, `revokedBy`, optional `contextLabel` (safe display text only), and `updatedAt`. Both users must be verified, the recipient must approve before access is active, and either named user may revoke (the rules require `revokedBy` to equal the actor's own UID). Revocation affects future reads without deleting historical bookings. Scope identifiers, `requesterUid`, and `recipientUid` are immutable after creation; a broader scope requires a new consent record. A `bookings/{bookingId}` read is additionally allowed, beyond the owning client and professional, when an `active` relationship links the reader to the booking's `clientId` at the matching `booking`, `professional`, or `all` scope.

### `bookingClaimTokens/{tokenHash}`

Server-only single-use claim material. Fields: `bookingId`, `contactId`, `emailHash`, `expiresAt`, `usedAt`, `revokedAt`, `createdAt`, and `attemptCount`. A token expires 24 hours after creation and is revoked after five failed validation attempts. Issuing a replacement revokes every outstanding token for the same booking/contact pair. Raw tokens are delivered only in the claim link and are never stored. Firestore client reads and writes are denied.

### `clientAccounts/{clientId}.authSettings`

Private authentication preference metadata only; never store passwords or email-link tokens here. Fields may include `passwordAuthEnabled`, `emailLinkEnabled`, `emailLinkLastRequestedAt`, and `recoveryMethod`. Firebase Auth owns credentials, email-link token lifecycle, session revocation, and provider-level replay protection. The trusted request boundary applies rate limits and gives expired or already-used links a password sign-in, password-reset, or new-link recovery path.

### `legalAcceptances/{acceptanceId}`

Immutable server-written evidence of registration or later policy acceptance. Fields: `uid`, `termsVersion`, `termsAcceptedAt`, `privacyVersion`, `privacyAcceptedAt`, `sourceFlow`, and `createdAt`. Versions use `YYYY-MM-DD` and must match `platformConfig/legal` at acceptance time. Users may read their own records; all direct client writes, updates, and deletes are denied. A changed required version creates a new record rather than overwriting an old one.

### `notificationPreferences/{uid}`

Private user-owned delivery preferences. Fields: `messageEmail`, `bookingEmail`, and `reminderEmail` (`immediate`, `digest`, or `none`), plus `updatedAt`. Security rules allow only the owner or an admin to read or update this document. Message email uses `immediate` for current delivery or `digest` for the daily 08:00-08:15 Europe/Paris worker. Unread booking-message notifications may receive server-only `digestQueuedFor` and `digestQueuedAt` fields after being included in a digest. Security and essential transaction emails ignore opt-out preferences where legally or operationally required.

### `mail/{messageId}`

Trigger Email extension queue. Only trusted server-side functions create system and notification mail requests; clients cannot create arbitrary mail documents. Admins may inspect safe delivery metadata.

Mail fields are normalized by the server: `to`, `message.subject`, `message.text`, `message.html`, `templateId`, `category`, `sourceId`, `createdAt`, and safe delivery metadata written by the extension. The queue never stores SMTP credentials, Gmail passwords, OAuth refresh tokens, or arbitrary user-supplied sender addresses.

For the email-first professional application, server-side Functions create these documents after the application or approval transaction succeeds. The document must contain the recipient, a subject, and the provider-specific message fields configured by the installed Trigger Email extension. The application UI reports `email queued` only after this write succeeds; actual delivery is verified separately by the extension's processed status and a real test mailbox.

### `notifications/{uid}/items/{notificationId}`

Server-created in-app notifications for an authenticated user. Booking creation/status/time/service/price changes, booking messages, reminders, and waitlist releases create documents with `type`, `bookingId`, optional `messageId`, `proId`, `title`, `body`, `createdAt`, and nullable `readAt`. Digest processing may add server-only `digestQueuedFor` and `digestQueuedAt` fields. Notification payloads do not contain `clientId` or client contact data. Notifications for an additional professional profile are written to its owner Auth UIDs and to active delegates holding the relevant permission, never to a non-auth profile ID. The recipient may read and update only `readAt`; clients cannot create or delete notifications.

### `proClientRecords/{proId}_{clientId}`

Private professional CRM record for one client relationship. `customRate` is an optional non-negative per-unit price override and `movementSurcharge` is an optional non-negative client-specific movement fee override. In addition to lifecycle and relationship fields, `tags` contains up to twenty profile-scoped strings. Overrides are applied in the professional's authorized booking context and are never copied to public profiles or client accounts.

### `professionalRequests/{applicationId}`

Publicly initiated professional application. The application ID is generated by the trusted submission boundary and is not the applicant's Auth UID.

Fields: `email`, `displayName`, `description`, `verificationFile` (`name`, `contentType`, `size`, `storagePath`), `emailVerificationStatus`, `status` (`awaiting-email-verification`, `pending-review`, `approved-awaiting-password`, `rejected`, `completed`, `expired`), `verificationTokenHash` (server-only), `verificationExpiresAt`, optional `verificationEmailLastSentAt` and `verificationResendCount` for bounded admin reissue (minimum 60-second interval, maximum five resends), `passwordSetupExpiresAt`, `reviewedBy`, `reviewedAt`, `decisionReason`, `createdAt`, and `updatedAt`. The Firebase Auth UID is added only during approval/provisioning and is not the public application ID.

Anonymous clients may submit only through the trusted boundary and may not read the document. Admins may read and update the full application. The trusted boundary, not the browser, writes the application document and verification-file metadata. Tokens are never returned in ordinary Firestore reads. The current authenticated-owner Firestore rule is therefore a legacy rule to replace before this lifecycle is implemented.

### `professionalRequestEvents/{eventId}`

Server-written audit events for submission, email verification, admin decision, provisioning, password setup, expiration, and delivery failure. Fields: `applicationId`, `type`, `at`, `actorUid` where applicable, `outcome`, and safe metadata. Applicants cannot read this collection.

### `logs/{logId}`

Tamper-proof audit trail written by trusted Functions only and readable by admins only. Common fields are `type`, `at`, `actorUid`, `actorRole`, `outcome`, `bookingId`, optional `seriesId`, optional `relationshipId`, optional `contactId`, `requestId` for idempotency, and safe `metadata`; raw tokens and full email addresses are forbidden.

Reservation-identity event types are `booking-contact-added`, `booking-contact-updated`, `booking-contact-removed`, `booking-claim-requested`, `booking-claim-succeeded`, `booking-claim-rejected`, `booking-claim-conflict`, `booking-claim-conflict-resolved`, `booking-claim-unlinked`, `booking-series-modified`, `history-share-requested`, `history-share-approved`, `history-share-revoked`, and `legal-acceptance-recorded`. Account recovery uses `account-recovery-issued` with safe `preservedData` and `wipedLinkedData` metadata. Failed trusted operations also emit the applicable type with `outcome: "failure"` and a safe reason code when doing so does not create an enumeration risk.

### `gcalTokens/{proId}`

Calendar OAuth token store. Client access is always denied.

### Admin-support collections

`creationLinks`, `platformConfig`, `supportTickets`, and `dataRequests` are introduced for Phase 3 infrastructure and later admin tooling.