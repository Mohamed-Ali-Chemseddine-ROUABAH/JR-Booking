# Google Calendar synchronization preferences

## Purpose

Provides the first Phase 14 configuration surface for imported Google Calendar events and reminders without pretending OAuth is configured.

## Reads and writes

- Reads `proProfiles/{proId}.calendarSettings`.
- Writes `calendarSettings.mode` (`ghost` or `solid`) and `calendarSettings.reminderMinutes`.

## UI

The professional opens the panel from the schedule's `Synchronisation calendrier` button. It clearly shows that the Google account is not connected until the OAuth client is configured, provides the ghost/solid choice, and stores the default reminder interval.

## Security and scope

No OAuth token is stored or exposed by this slice. The existing Functions callback remains the server-side OAuth boundary. Bidirectional event synchronization, token storage, imported-event rendering, and reminder delivery remain subsequent Phase 14 work.
