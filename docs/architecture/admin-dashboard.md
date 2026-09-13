# Admin dashboard

## Purpose

Provides the first protected Phase 13 administration surface for reviewing professional applications.

The command-center summary at the top of the page gives an operational snapshot of open professional applications, non-completed support tickets, non-completed data requests, and creation links expiring within seven days. It is a read-only aggregation of admin-authorized collections and exposes counts only, not applicant, client, or token details.

## Reads

- `professionalRequests`, queried for documents with `status == "pending-review"`.
- `professionalRequests`, `supportTickets`, `dataRequests`, and `creationLinks` for the command-center counts.
- The request's stored verification-file URL is rendered as an admin-only external link.

## Writes

- Updates a verified application from `pending-review` to `approved` or `rejected` after a French confirmation prompt.
- Adds `reviewedBy` and `reviewedAt` to the reviewed request.

## Authorization

The page uses `requireAuth({ allowedRoles: ["admin"] })`. Firestore rules allow only admin users to update or delete request documents; applicant owners can read their own document but cannot approve it. Storage rules keep verification files readable only by admins.

## Scope boundary

The review screen itself does not assign claims, send password links, or create profile documents directly. Those privileged effects are delegated to the server-side provisioning step below. The admin UI must not expose an approval action for `awaiting-email-verification`, `rejected`, `expired`, or already completed applications.

The provisioning step is implemented server-side by the `provisionProfessionalAccount` callable Function. After an admin marks a verified request approved, the callable rechecks the admin claim, creates or links the Auth user, assigns `{ professional: true, role: "professional" }`, creates the private `proProfiles/{uid}` record, creates the initial `publicProfiles/{uid}` mirror, sends a one-time password-setup email, and marks the request `approved-awaiting-password`. The browser never assigns claims or creates these privileged profile documents.

The dashboard also reads the latest 30 documents from `logs`, ordered by timestamp, and renders the action, collection, document, and time. The audit trigger now includes `professionalRequests`. The audit panel requires the admin claim; applicants and professionals cannot read `logs`. In local development, the trigger must run in the same Firebase emulator suite as Firestore for entries to appear.

Provisioned professional requests expose a profile-scoped lifecycle action. `Bannir` calls the Admin SDK `setAccountBanStatus` function, which rechecks the admin claim, disables the Auth user, adds `banned: true` to claims, and marks the private profile `accountStatus: "banned"`. `Réintégrer` reverses those changes. The browser only sends the target UID and desired state; it cannot disable users or write claims directly.

The dashboard also exposes read/update queues for `supportTickets` and `dataRequests`. Admins can see the subject/type, creator, and current status, then move an item between `pending`, `in-progress`, and `completed`. The existing Firestore rules keep these collections private to their creator and admins; the current slice adds only the admin-side queue, not new client submission forms.

The security section also provides a non-destructive account recovery action. An admin supplies a target UID or email; `issueAccountRecovery` generates a Firebase password-reset link server-side, queues it through Trigger Email, and writes an `account-recovery-issued` audit event with `preservedData: true`. The reset URL never reaches the browser. Data-wiping recovery is intentionally a separate future operation requiring a stronger deletion policy and confirmation.

Profile lifecycle controls use the same typed-confirmation and grace-period principle as client erasure. `scheduleProfessionalProfileErasure` requires `SUPPRIMER CE PROFIL`, records a 30-day `erasureRequest`, marks the profile `limbo`, disables its owner account, and writes an audit event. `cancelProfessionalProfileErasure` restores `active` state and re-enables the owner during the grace period. Permanent deletion is intentionally not performed by either browser action.

After the grace timestamp has elapsed, `purgeProfessionalProfile` accepts the stronger `SUPPRIMER DEFINITIVEMENT CE PROFIL` confirmation, deletes the private/public profile pair, preserves historical bookings and audit records, and deletes the Auth owner only when no other owned professional profile remains. It refuses active, non-limbo, or not-yet-expired profiles.

Category oversight uses `listPlatformCategories` to aggregate public category usage and `renamePlatformCategory` to replace one exact category across all `publicProfiles` in a single admin-authorized batch. Duplicate results are de-duplicated and the operation writes a safe audit event; category changes never alter private professional settings.

Public-profile moderation uses `moderatePublicProfile` to redact the public description and/or avatar URL for an admin-supplied profile ID. It requires a reason, preserves private `proProfiles` data, and writes a `public-profile-moderated` audit event. The browser never writes public profile moderation fields directly.

Platform announcements use `queuePlatformBroadcast` to target clients, professionals, or both. The server classifies recipients from Auth claims, excludes disabled/admin accounts, caps a broadcast at 500 recipients, writes one normalized `mail` queue document per recipient, and records only the audience/count/subject in the audit log. The browser never writes broadcast mail documents directly.

Platform health uses `getPlatformHealthSummary` to return admin-only aggregates: professional profiles, client accounts, bookings, Auth users, recent mail queue/failure counts, failed privileged operations, Calendar errors, and recent audit events. It does not return user emails, message content, tokens, or profile details.

Professional application review supports a bounded bulk action through `bulkReviewProfessionalApplications`. The admin selects up to 25 `pending-review` applications and applies one approved/rejected decision; stale or already-decided records are skipped, and one safe audit event records the reviewed IDs and count.
