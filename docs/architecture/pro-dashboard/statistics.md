# Statistics and activity reporting

## Purpose

Provides the first Phase 12 read-only statistics surface for the owning professional.

## Reads

- `bookings`, filtered by `proId == currentUser.uid`.
- `customPrice` when present, otherwise the sanitized `paymentContext.balance` stored on the booking.
- `proProfiles/{uid}.workingHours` for selected working days, daily hours, and recurring break used by occupancy calculations.

## Writes

None. Metrics are computed at read time from authorized booking documents; no client-writable revenue counter is introduced.

## Metrics

The current slice filters by booking start date, activity type, and status, then displays total bookings, gross revenue, realized revenue from completed bookings, revenue still in progress, completion rate, no-show rate, rejected booking count, occupancy against available working hours, and repeat-client retention. Gross revenue combines realized and in-progress resolved prices; rejected and no-show bookings are excluded from money totals. Occupancy excludes rejected bookings and retention counts clients with at least two eligible bookings. The revenue note makes clear that values come from real booking data.

It also renders a status-distribution bar view, an SVG daily revenue trend line, a color-coded category revenue-share strip with a labeled percentage legend, daily trend and category bars, high-signal reporting highlights (peak revenue day, average daily revenue, and leading category share), and explicit empty states when a selected range has no trend or category data. The print-ready activity report uses only completed (`done`) bookings from the active date/activity/status selection, recalculates its highlights from that completed dataset, includes booking date, status, and resolved amount, and uses the browser print dialog so the professional can save it as PDF locally.

## Authorization

Firestore's booking read rule limits the query to the professional's own bookings. Clients and anonymous visitors cannot open this surface or read the professional's booking collection.

## Follow-up

Populated browser confirmation and the remaining external delivery gates are still tracked in the verification log.
