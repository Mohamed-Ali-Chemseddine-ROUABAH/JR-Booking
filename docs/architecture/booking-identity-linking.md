# Booking identity and email linking

## Purpose

Links professional-created guest bookings to verified client accounts without silently merging people, histories, or notification contacts.

## Planned slices

1. **Additional booking emails:** the professional can add or remove notification contacts with roles such as primary, guardian, payer, or participant. This changes notification routing only.
2. **Verified booking claim:** a client verifies an email and explicitly claims a matching booking through a one-time token or authenticated claim flow. The server attaches `clientId` or `serviceRecipientUid` only after the claim is accepted.
3. **Series modification scope:** a professional chooses `this`, `this-and-following`, or `all-in-series`. The server records the scope and applies an idempotent transaction to the affected occurrences.
4. **Consent relationship:** two verified clients may request narrowly scoped history sharing. Both approve; either can revoke. No automatic fusion occurs.

5. **Rules and trusted claim boundary:** Firestore booking rules must explicitly allow only the approved professional/admin operational fields; new identity fields are not added to client writes by default. A callable or HTTPS Function performs the booking-claim transaction after validating the authenticated UID, verified email, single-use token, booking state, and conflict rules.

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

## Authentication decision

Firebase email/password remains the baseline for clients. Optional email-link sign-in may simplify repeat access on a known device or require a fresh link on a new device. A 3- or 4-digit PIN is rejected as the sole credential because it is too weak for private bookings, messages, and payment data. Terms and privacy acceptance are versioned metadata, not a substitute for authentication.

## Failure and recovery requirements

- Claim links expire and are single-use.
- Duplicate claims are idempotent.
- Removing a contact stops future notifications but does not delete history.
- Revoking shared history stops future access but does not erase audit records.
- A failed recurring-series update can be retried without duplicating or skipping occurrences.
- Email delivery failure never rolls back a saved booking or message.
- A passwordless email link is an optional sign-in method, not the only recovery method; links expire, are single-use, and must handle forwarded links and inaccessible email.
- Registration records the accepted terms and privacy versions and timestamps; the checkbox is not treated as the security boundary.

## Unlink semantics

The UI must expose separate actions with separate confirmations:

- **Remove contact:** stop future notifications to one email; preserve bookings and audit history.
- **Revoke shared history:** stop future access granted by a `clientRelationships` record; preserve source bookings and audit history.
- **Unlink booking claim:** detach a client association only through the server claim policy; do not delete the booking or silently expose it to another account.

These actions must never be represented by two ambiguous `X` buttons with the same label.

## Recurring occurrence model

Each recurring occurrence is a separate `bookings/{bookingId}` document sharing a `seriesId` and carrying an `occurrenceIndex`. The server applies `this`, `this-and-following`, or `all-in-series` to a deterministic set of occurrence IDs in an idempotent transaction or retryable job. A partial failure reports affected and unaffected occurrences and never duplicates an occurrence.