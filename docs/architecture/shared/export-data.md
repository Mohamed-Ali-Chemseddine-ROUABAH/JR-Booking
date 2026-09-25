# Local data export

## Purpose

Builds a browser-only JSON export for the authenticated professional without a server round trip.

## Inputs

- The signed-in professional identity.
- The active professional profile ID.
- Booking DTOs already authorized and loaded by the professional dashboard.

## Outputs

- A downloaded `application/json` file containing export time, account identity, active profile ID, and an allow-listed booking summary.

## Privacy

The exporter does not include Firebase tokens, credentials, private preparation notes, or arbitrary fields copied from the booking document. The browser creates the file locally and does not upload it.
