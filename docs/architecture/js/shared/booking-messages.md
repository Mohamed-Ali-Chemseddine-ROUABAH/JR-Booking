# Booking messages

- **Production file:** `public/js/shared/booking-messages.js`
- **Purpose:** Renders authorized booking message threads and sends messages through the trusted callable.
- **Data/security:** Messages live under `bookings/{bookingId}/messages`; direct browser writes are denied and notification bodies are bounded.
- **Verification:** Booking-series and delegated-access emulator coverage records authorized reads, sends, and denials.
