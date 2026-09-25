# Services and packages

- **Production file:** `public/js/pro-dashboard/services-packages.js`
- **Purpose:** Lets a professional define named services/packages with duration in minutes and a non-negative price.
- **Firestore:** Reads and writes `proProfiles/{profileId}.services` through the active professional profile context.
- **Security rules:** Uses the existing owner/admin `proProfiles` boundary; the browser writes only the active owner's settings document.
- **Feature flag:** Professional dashboard authentication gate.
- **Mockup references:** Professional service/package settings in `docs/mockups/IMPLEMENTATION_REFERENCE.md` and Master Specification Part 6.4.
- **Verification:** Settings modal load/save and normalized service values must be verified before client booking selection is connected.
