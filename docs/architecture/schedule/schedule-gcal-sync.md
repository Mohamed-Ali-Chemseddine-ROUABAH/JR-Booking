# Google Calendar synchronization preferences

## Purpose

Provides the Phase 14 Google Calendar configuration surface and the first server-backed event import for the professional schedule.

## Reads and writes

- Reads `proProfiles/{proId}.calendarSettings` in the client settings modal and server-side sync callable.
- Writes `calendarSettings.mode` (`ghost` or `solid`) and `calendarSettings.reminderMinutes`.
- The callable `syncGoogleCalendar` reads the server-only refresh token from `gcalTokens/{proId}`, refreshes it with Google, and returns only bounded, sanitized primary-calendar events for a maximum 31-day range.

## UI

The professional opens the panel from the schedule's `Synchronisation calendrier` button. It provides the ghost/solid choice, stores the default reminder interval, and starts OAuth when the account is not connected. The dashboard loads the current seven-day event window and renders imported events as unavailable slots; ghost events remain visually distinct and read-only.

## Security and scope

Refresh tokens remain server-only in `gcalTokens/{proId}` and are never returned to the browser. Client schedule code receives only event IDs, titles, times, presentation mode, and the optional Google link. Push webhooks, event export/editing, automatic refetch on week navigation, and reminder delivery remain subsequent Phase 14 work.
