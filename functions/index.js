const admin = require("firebase-admin");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();

const auditedCollections = new Set([
    "bookings",
    "proProfiles",
    "publicProfiles",
    "clientAccounts",
    "creationLinks",
    "platformConfig",
    "supportTickets",
    "dataRequests"
]);

exports.writeAuditLog = onDocumentWritten("{collectionId}/{documentId}", async (event) => {
    const { collectionId, documentId } = event.params;

    if (!auditedCollections.has(collectionId)) {
        return;
    }

    const beforeExists = event.data.before.exists;
    const afterExists = event.data.after.exists;
    const action = beforeExists && afterExists ? "update" : beforeExists ? "delete" : "create";

    await admin.firestore().collection("logs").add({
        action,
        collectionId,
        documentId,
        path: `${collectionId}/${documentId}`,
        at: admin.firestore.FieldValue.serverTimestamp(),
        source: "firestore-trigger"
    });
});

exports.calendarAuthCallback = onRequest((request, response) => {
    response.status(501).json({
        error: "calendar_oauth_not_configured",
        message: "Google Calendar OAuth is scaffolded and will be implemented in Phase 14."
    });
});

exports.calendarWebhook = onRequest((request, response) => {
    response.status(501).json({
        error: "calendar_webhook_not_configured",
        message: "Google Calendar webhooks are scaffolded and will be implemented in Phase 14."
    });
});