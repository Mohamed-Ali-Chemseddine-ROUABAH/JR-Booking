# Professional account request

## Purpose

Collects an authenticated professional application and its verification document for later admin review.

## Reads and writes

- Writes `professionalRequests/{uid}` in Firestore with the applicant identity, description, verification-file metadata, `status: "pending"`, and `createdAt`.
- Uploads the selected PDF, JPEG, or PNG to `professionalRequests/{uid}/{fileName}` in Firebase Storage.
- Reads the current Firebase Auth user to bind the request to the authenticated UID.

## Authorization

The Firestore request document can be read by its owner or an admin; only an admin can update or delete it. Storage creation is limited by `storage.rules` to an authenticated user writing under their own UID, with a 10 MB size limit and PDF/JPEG/PNG content types. Verification files are readable by the owning applicant and admins only; other users remain denied.

## Workflow

The landing-page CTA opens `request-professional.html`. Unauthenticated visitors are redirected to login. After authentication, the form prefills the email, validates the file locally, uploads the file, then creates the pending Firestore application. No professional account or claim is granted by this page; that remains an admin workflow for a later Phase 13 slice.
