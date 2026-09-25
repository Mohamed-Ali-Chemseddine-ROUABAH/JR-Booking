# Google Calendar synchronization preferences

## Purpose

Provides the Phase 14 Google Calendar configuration surface and the first server-backed event import for the professional schedule.

## Reads and writes

- Reads `proProfiles/{proId}.calendarSettings` in the client settings modal and server-side sync callable.
- Writes `calendarSettings.mode` (`ghost` or `solid`) and `calendarSettings.reminderMinutes`.
- The callable `syncGoogleCalendar` reads the server-only refresh token from `gcalTokens/{proId}`, refreshes it with Google, and returns only bounded, sanitized primary-calendar events for a maximum 31-day range.

## UI

The professional opens the panel from the schedule's `Synchronisation calendrier` button. It provides the ghost/solid choice, stores the default reminder interval, starts OAuth when the account is not connected, and can register a Google Calendar watch channel after OAuth. The dashboard loads the visible event window and renders imported events as unavailable slots; ghost events remain visually distinct and read-only. Previous, today, next, and 1/3/7-day view changes refetch the corresponding bounded Google Calendar range.

## Security and scope

Refresh tokens, channel IDs, channel tokens, and resource IDs remain server-only in `gcalTokens/{proId}` and are never returned to the browser. `calendarWebhook` accepts only matching Google channel headers, records a refresh signal, and returns no token data. `syncBookingToGoogleCalendar` creates or updates a Google event for an owned booking and stores only the event ID on the booking; the action is available from the professional booking context menu. `calendarReminderWorker` runs every 15 minutes, uses `calendarSettings.reminderMinutes`, queues one Trigger Email reminder for accepted bookings, and marks `calendarReminderQueuedAt` transactionally to prevent duplicates. Client schedule code receives only event IDs, titles, times, presentation mode, and the optional Google link.
