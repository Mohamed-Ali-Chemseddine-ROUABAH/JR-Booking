# Admin dashboard

## Purpose

Provides the first protected Phase 13 administration surface for reviewing professional applications.

## Reads

- `professionalRequests`, queried for documents with `status == "pending"`.
- The request's stored verification-file URL is rendered as an admin-only external link.

## Writes

- Updates an application to `approved` or `rejected` after a French confirmation prompt.
- Adds `reviewedBy` and `reviewedAt` to the reviewed request.

## Authorization

The page uses `requireAuth({ allowedRoles: ["admin"] })`. Firestore rules allow only admin users to update or delete request documents; applicant owners can read their own document but cannot approve it. Storage rules keep verification files readable only by admins.

## Scope boundary

The review screen itself does not assign claims or create profile documents directly. Those privileged effects are delegated to the server-side provisioning step below; admin claims, reinstatement, audit-log UI, and broader platform controls remain later Phase 13 work.

The provisioning step is now implemented server-side by the `provisionProfessionalAccount` callable Function. After an admin marks a request `approved`, the callable rechecks the admin claim, sets `{ professional: true, role: "professional" }` on the applicant's Auth user, creates the private `proProfiles/{uid}` record, creates the initial `publicProfiles/{uid}` mirror, and marks the request `provisioned`. The browser never assigns claims or creates these privileged profile documents.

The dashboard also reads the latest 30 documents from `logs`, ordered by timestamp, and renders the action, collection, document, and time. The audit trigger now includes `professionalRequests`. The audit panel requires the admin claim; applicants and professionals cannot read `logs`. In local development, the trigger must run in the same Firebase emulator suite as Firestore for entries to appear.

Provisioned professional requests expose a profile-scoped lifecycle action. `Bannir` calls the Admin SDK `setAccountBanStatus` function, which rechecks the admin claim, disables the Auth user, adds `banned: true` to claims, and marks the private profile `accountStatus: "banned"`. `Réintégrer` reverses those changes. The browser only sends the target UID and desired state; it cannot disable users or write claims directly.

The dashboard also exposes read/update queues for `supportTickets` and `dataRequests`. Admins can see the subject/type, creator, and current status, then move an item between `pending`, `in-progress`, and `completed`. The existing Firestore rules keep these collections private to their creator and admins; the current slice adds only the admin-side queue, not new client submission forms.
