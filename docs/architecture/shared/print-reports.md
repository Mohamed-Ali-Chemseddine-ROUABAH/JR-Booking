# Print reports

## Revenue handling

Printable professional summaries resolve prices from `customPrice`, then `paymentContext.balance`, then the booked service price. Gross revenue combines `done`, `pending`, and `accepted` booking values; rejected and no-show bookings do not contribute to revenue totals. Price-bearing report rows use the same fallback order.

## Purpose

Builds print-ready professional dashboard reports without a server or production data export. Documents are opened from Blob URLs so the new page is populated before the browser print dialog starts.

## Inputs

- Authorized professional booking DTOs already loaded by the dashboard or statistics view.
- French labels from the owning string module.

## Outputs

- Professional schedule report with date, time, anonymized client label, and status.
- Current-month booking report, price-inclusive booking report, and summary-only total report selected from the professional navbar print menu.
- The same four local modes are available from the client navbar using the client's own and explicitly authorized shared-history booking DTOs.
- Both menus expose an anonymous-mode checkbox for the schedule report; the professional menu defaults it on, while the client menu defaults it off so the related professional remains identifiable.
- Statistics activity report with the active date/status filters and booking rows.
- CRM client-history report with the selected client's identity and filtered booking/status history.

## Privacy

The module receives already-authorized data only. Reports are generated locally in the browser and are not uploaded to Firebase.
