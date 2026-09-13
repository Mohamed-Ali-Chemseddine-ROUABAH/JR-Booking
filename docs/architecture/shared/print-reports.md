# Print reports

## Purpose

Builds print-ready professional dashboard reports without a server or production data export. Documents are opened from Blob URLs so the new page is populated before the browser print dialog starts.

## Inputs

- Authorized professional booking DTOs already loaded by the dashboard or statistics view.
- French labels from the owning string module.

## Outputs

- Professional schedule report with date, time, client, status, amount, and summary totals.
- Statistics activity report with the active date/status filters and booking rows.
- CRM client-history report with the selected client's identity and filtered booking/status history.

## Privacy

The module receives already-authorized data only. Reports are generated locally in the browser and are not uploaded to Firebase.
