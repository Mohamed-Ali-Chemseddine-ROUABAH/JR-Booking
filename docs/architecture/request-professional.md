# Professional account request

## Purpose

Collects a public, email-first professional application and its verification document for later admin review. A new applicant does not need an existing login or password.

## Reads and writes

- Submits through a trusted public boundary that creates `professionalRequests/{applicationId}` with `status: "awaiting-email-verification"`.
- Uploads the selected PDF, JPEG, or PNG to a private application-scoped Storage path after server-side validation.
- Writes only token hashes and safe application metadata; raw verification and password-setup tokens are never stored in client-readable documents.
- Queues an application verification email whose single-use token points to the trusted HTTPS verification endpoint; this is not Firebase Auth email verification because Auth is provisioned only after approval.
- `verifyProfessionalApplication` hashes the token, performs the idempotent state transition to `pending-review`, clears the usable token, and queues a receipt email.

## Authorization

The public form cannot write arbitrary request documents directly. A callable or HTTPS function validates the request, applies abuse controls, creates the application ID, and controls the private upload boundary. Only admins can read the full application, update its decision, or read its verification document. Email verification and password setup are single-use and time-limited. No client-side code assigns Auth claims or creates professional profiles.

## Workflow

The landing-page CTA opens `request-professional.html` for anonymous and authenticated visitors. The form validates locally, submits the application, and confirms that the applicant must check their email. After verification, the admin sees the application in `pending-review`. Approval triggers server-side Auth/profile provisioning and sends the password-setup email. The applicant can then set a password and sign in as a professional.

The existing authenticated-first implementation is deprecated by this specification and must not be extended. **Implementation decision:** use the public HTTPS `submitProfessionalApplication` endpoint with a multipart request. It validates fields and file, generates the application ID, stores the file privately, writes `professionalRequests`, and queues the verification email. The client never writes `professionalRequests` directly and never chooses the application ID. The endpoint must include abuse protection and must not reveal whether an email already has an account.

The submission confirmation must be shown only after the file, application, and verification-email queue writes all succeed. If one step fails, the application remains retryable with the same safe status and the verification file is not exposed. The multipart boundary is intentional: it keeps the browser flow to one request while ensuring the server owns validation, application IDs, private Storage paths, and the mail queue write.

Email delivery is not implicit. The Functions write the verification message to `mail/{messageId}` and may report only `email queued`; the Trigger Email extension must be installed and configured before a human can verify actual delivery. Approval and password-setup messages use the same queue and must have their own delivery test.
