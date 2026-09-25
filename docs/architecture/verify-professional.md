# Professional application verification

## Purpose

Completes the single-use email verification step for a public professional application before admin review.

## Production owner

- `public/verify-professional.html`
- `functions/index.js` (`verifyProfessionalApplication`)
- Hosting rewrite `/api/professional/verify`

## Workflow

The page reads the token from the verification email and calls the trusted HTTPS endpoint. The endpoint hashes the token, finds the matching application, checks expiry and current state, clears the usable token, changes `awaiting-email-verification` to `pending-review`, and queues a receipt email. Repeated valid clicks are idempotent; invalid or expired tokens expose only a generic recovery message.

## Security

The browser never reads or updates the application document. The endpoint returns only a safe status message. Verification tokens are stored only as hashes and are single-use.