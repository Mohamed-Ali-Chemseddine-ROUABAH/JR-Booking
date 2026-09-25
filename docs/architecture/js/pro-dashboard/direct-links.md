# Direct booking links and QR codes

- **Production file:** `public/js/pro-dashboard/direct-links.js`.
- **Purpose:** Lets a professional share a direct profile URL or a URL that preselects one public service.
- **Imports:** Firestore document reads, `core/firebase-init.js`, and `core/strings-fr.js`.
- **DOM owner:** Creates and owns the direct-link/QR settings modal.
- **Firestore/Storage:** Reads the owner's private profile only to enumerate configured service names; no writes and no Storage access.
- **Security rules:** Only profile owners/admins can read `proProfiles`. Generated URLs contain only the public profile ID and optional service index.
- **URLs:** General profile links use `profile.html?pro={profileId}`. Service links add `service={serviceIndex}`; the public profile validates and selects that service when it exists.
- **QR:** The modal sends the public booking URL to `api.qrserver.com` to render the QR image. No private booking, client, credential, or profile-setting data is encoded; this third-party request is limited to the public URL.
- **Privacy:** Only the public profile ID and optional public service index are shared. Payment, client, booking, and private profile data never enter the link.
- **Feature flag:** Professional direct sharing.
- **Mockup reference:** Professional shareable direct link/QR action in Master Specification Part 6.4 and the public profile booking surface in `docs/mockups/IMPLEMENTATION_REFERENCE.md`.
- **Verification:** Direct profile and service links entry in `docs/verification/VERIFICATION_LOG.md`.
