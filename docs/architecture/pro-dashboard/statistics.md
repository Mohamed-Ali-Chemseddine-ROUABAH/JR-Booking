# Statistics and activity reporting

## Purpose

Provides the first Phase 12 read-only statistics surface for the owning professional.

## Reads

- `bookings`, filtered by `proId == currentUser.uid`.
- `customPrice` when present, otherwise the sanitized `paymentContext.balance` stored on the booking.

## Writes

None. Metrics are computed at read time from authorized booking documents; no client-writable revenue counter is introduced.

## Metrics

The current slice filters by booking start date and status, then displays total bookings, completed revenue, revenue still in progress, completion rate, no-show rate, and rejected booking count. The revenue note makes clear that values come from real booking data.

It also renders a status-distribution bar view and a print-ready activity report for the active filters. The report contains booking date, status, and resolved amount, and uses the browser print dialog so the professional can save it as PDF locally.

## Authorization

Firestore's booking read rule limits the query to the professional's own bookings. Clients and anonymous visitors cannot open this surface or read the professional's booking collection.

## Follow-up

Richer retention, occupancy, and trend analysis remain subsequent Phase 12 slices.
