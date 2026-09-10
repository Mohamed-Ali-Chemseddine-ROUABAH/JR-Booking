# Communication and email delivery

## Purpose

Separates private professional-client conversations from platform email delivery. The platform sender is configured once through Firebase Trigger Email; individual professionals do not connect Gmail or paste credentials into the website.

## In-platform messages

Messages belong to an authorized booking in `bookings/{bookingId}/messages/{messageId}`. The client, active professional, and delegates with the explicit messaging permission may read the thread. The sender may create a message; message bodies are not exposed to anonymous users or unrelated clients. A message is committed independently from notification delivery.

## Email notifications

After a message or booking event is authorized and saved, a trusted server-side function checks the recipient's `notificationPreferences/{uid}` and writes a normalized document to `mail/{messageId}` when an email is appropriate. The Trigger Email extension sends from the platform-configured sender. The email contains a short summary and a safe authenticated deep link; the complete message remains in Firestore.

The UI must distinguish `message saved`, `email queued`, `email sent`, and `email failed`. A failed email does not delete or roll back the message. Daily digests are a later batching slice; immediate notifications are the initial implementation.

## Security

The browser cannot write arbitrary `mail` documents and cannot choose a sender address. Gmail credentials and OAuth refresh tokens are never stored in Firestore or accepted from a professional. A future "send as professional" integration requires separate approval, provider-specific OAuth, consent, token revocation, and audit rules; it is outside the base platform.

## Required setup

Firebase Trigger Email must be installed and configured with the platform sending account before delivery can be marked successful. Local and emulator tests may assert queue creation, but real delivery requires a sandbox mailbox and the configured extension.