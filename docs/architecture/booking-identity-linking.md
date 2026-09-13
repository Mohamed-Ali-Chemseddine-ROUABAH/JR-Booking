# Booking identity and email linking

## Purpose

Links professional-created guest bookings to verified client accounts without silently merging people, histories, or notification contacts.

## Delivery slices

1. **Additional booking emails (implemented):** the professional can add or remove notification contacts with canonical roles. This changes notification routing only.
2. **Verified booking claim (implemented):** a professional issues a 24-hour one-time link for a persisted contact. An authenticated client with the matching verified Firebase Auth email previews and explicitly accepts or rejects the booking. The server attaches `clientId` or `serviceRecipientUid` only after acceptance; linked notification-only roles receive no booking-history access.
3. **Series modification scope:** a professional chooses `this`, `this-and-following`, or `all-in-series`. The server records the scope and applies an idempotent transaction to the affected occurrences.
4. **Consent relationship (implemented):** two verified clients may request narrowly scoped history sharing. Both approve; either can revoke. No automatic fusion occurs. The requester creates a `pending` `clientRelationships/{deterministicId}` record naming a recipient discovered only through a `linkedUid` already visible on a booking the requester owns; the recipient approves; either named party may revoke. Access to the shared `booking`, `professional`, or `all` scope of bookings is granted only while the record's `status` is `active`, and is derived, read-only history: the client dashboard never renders write actions for a booking the viewer does not own.

5. **Rules and trusted claim boundary (implemented for contacts and claims):** Firestore booking rules explicitly allow only approved direct operational fields; identity and claim fields are excluded from client writes. Trusted callable Functions validate the authenticated UID, verified email, single-use token, booking state, ownership, and conflict rules.

The contact cap is ten, with exactly one active `primary` contact. Allowed roles are `primary`, `guardian`, `payer`, `participant`, and `assistant`. A claimed primary may become `clientId`, a claimed participant may become `serviceRecipientUid`, and the remaining roles may receive a `linkedUid` for verification and notifications without gaining history access.

## Security boundaries

- An email address in a booking is not an authorization credential.
- A matching email never grants access to all bookings for that address.
- The service recipient, payer, guardian, and notification contact are separate roles.
- Full history is not merged when a second email is added.
- Reads use verified Auth UIDs plus explicit booking/relationship scope.
- Every claim, contact change, series modification, link, unlink, approval, and revocation is audited.
- Booking contacts are capped at a small configured maximum, use normalized lowercase emails, and reject duplicate email/role pairs.
- A claim conflict never silently reassigns a booking: the server returns a review-needed state for professional/admin resolution.
- Firestore reads never use an email string as an authorization condition.

## Claim state and recovery

- `unclaimed` -> `pending` occurs only after the trusted handler validates the booking-specific token, authenticated UID, and verified Firebase Auth email.
- `pending` -> `claimed` is idempotent for the same booking, contact, and UID. A different UID, an existing incompatible link, or an ambiguous contact role produces `review-required` without changing identity ownership.
- The claimant may reject a pending claim, producing `rejected`. Expired or revoked tokens produce `expired` and may be replaced only with a newly issued token.
- Conflict detail is admin-only. The booking carries only a safe reason code; an admin approves or denies the conflict. The professional may correct contact data and issue a new invitation but cannot assign an Auth UID.
- A linked client may request an unlink through the trusted handler; an admin may unlink during account recovery. The result is `unlinked`, clears only the applicable UID association, revokes outstanding tokens, preserves the booking, and grants no replacement account access.

## Authentication decision

Firebase email/password remains the baseline for clients. Optional email-link sign-in may simplify repeat access on a known device or require a fresh link on a new device. A 3- or 4-digit PIN is rejected as the sole credential because it is too weak for private bookings, messages, and payment data. Terms and privacy acceptance are versioned metadata, not a substitute for authentication.

## Failure and recovery requirements

- Claim links expire after 24 hours and are single-use. Five failed validation attempts revoke the token; issuing a replacement revokes older tokens for the same booking/contact pair.
- Duplicate claims are idempotent.
- Removing a contact stops future notifications but does not delete history.
- Revoking shared history stops future access but does not erase audit records.
- A failed recurring-series update can be retried without duplicating or skipping occurrences.
- Email delivery failure never rolls back a saved booking or message.
- A passwordless email link is an optional sign-in method, not the only recovery method; Firebase Auth controls expiry and one-time consumption, while the request boundary rate-limits sends. Expired, used, forwarded, or inaccessible-email cases offer a new link, password sign-in, or password reset without changing identity.
- Registration submits the active `YYYY-MM-DD` terms and privacy versions from `platformConfig/legal`. A trusted handler records an immutable `legalAcceptances` event; a checkbox or editable account field is not treated as evidence or a security boundary.

## Unlink semantics

The UI must expose separate actions with separate confirmations:

- **Remove contact:** stop future notifications to one email; preserve bookings and audit history.
- **Revoke shared history:** stop future access granted by a `clientRelationships` record; preserve source bookings and audit history.
- **Unlink booking claim:** detach a client association only through the server claim policy; do not delete the booking or silently expose it to another account.

These actions must never be represented by two ambiguous `X` buttons with the same label.

## Recurring occurrence model

Each recurring occurrence is a separate `bookings/{bookingId}` document sharing a `seriesId` and carrying an `occurrenceIndex`. The server applies `this`, `this-and-following`, or `all-in-series` to a deterministic set of occurrence IDs in an idempotent transaction or retryable job. A partial failure reports affected and unaffected occurrences and never duplicates an occurrence.

## Audit contract

Trusted handlers write immutable `logs` events for contact add/update/remove, claim request/success/rejection/conflict/resolution/unlink, series modification, history-share request/approval/revocation, and legal acceptance. Each event records the actor, target IDs, outcome, timestamp, and idempotency request ID plus safe metadata; it never records a raw claim token or full email address. The canonical event names and fields are defined in `docs/database_schema.md`.