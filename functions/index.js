const admin = require("firebase-admin");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const crypto = require("node:crypto");

const googleClientSecret = defineSecret("GOOGLE_CLIENT_SECRET");
const googleClientId = defineString("GOOGLE_CLIENT_ID");
const googleRedirectUri = defineString("GOOGLE_REDIRECT_URI", { default: "https://jr-booking-premium.web.app/api/calendar/google/callback" });
const googleCalendarScopes = defineString("GOOGLE_CALENDAR_SCOPES", { default: "https://www.googleapis.com/auth/calendar.events" });

admin.initializeApp();

const auditedCollections = new Set([
    "bookings",
    "proProfiles",
    "publicProfiles",
    "clientAccounts",
    "creationLinks",
    "platformConfig",
    "supportTickets",
    "dataRequests",
    "professionalRequests"
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
        at: new Date(),
        source: "firestore-trigger"
    });
});

exports.calendarAuthCallback = onRequest({ secrets: [googleClientSecret] }, (request, response) => {
    handleCalendarCallback(request, response).catch((error) => {
        console.error(error);
        response.status(500).send("Google Calendar authorization could not be completed.");
    });
});

exports.calendarWebhook = onRequest((request, response) => {
    response.status(503).json({
        error: "calendar_webhook_not_configured",
        message: "Google Calendar webhooks require OAuth configuration before activation."
    });
});

exports.provisionProfessionalAccount = onCall(async (request) => {
    if (!request.auth?.token?.admin) {
        throw new HttpsError("permission-denied", "Administrator claim required.");
    }

    const requestId = String(request.data?.requestId || "");
    if (!requestId) throw new HttpsError("invalid-argument", "Request ID is required.");

    const firestore = admin.firestore();
    const requestRef = firestore.collection("professionalRequests").doc(requestId);
    const requestSnapshot = await requestRef.get();
    if (!requestSnapshot.exists) throw new HttpsError("not-found", "Professional request not found.");

    const application = requestSnapshot.data();
    if (application.status !== "approved") throw new HttpsError("failed-precondition", "Request must be approved first.");

    const user = await admin.auth().getUser(requestId);
    await admin.auth().setCustomUserClaims(requestId, { professional: true, role: "professional" });
    await firestore.collection("proProfiles").doc(requestId).set({
        owners: [requestId],
        personalInfo: { displayName: application.displayName || user.displayName || "Professionnel" },
        accountStatus: "active",
        createdAt: new Date()
    }, { merge: true });
    await firestore.collection("publicProfiles").doc(requestId).set({
        owners: [requestId],
        displayName: application.displayName || user.displayName || "Professionnel",
        name: application.displayName || user.displayName || "Professionnel",
        shortDescription: application.description || "",
        categories: [],
        visibleFields: { displayName: true, shortDescription: true, categories: true },
        updatedAt: new Date()
    }, { merge: true });
    await requestRef.update({ status: "provisioned", provisionedAt: new Date(), provisionedBy: request.auth.uid });

    return { requestId, status: "provisioned" };
});

exports.setAccountBanStatus = onCall(async (request) => {
    if (!request.auth?.token?.admin) {
        throw new HttpsError("permission-denied", "Administrator claim required.");
    }
    const targetUid = String(request.data?.targetUid || "");
    const banned = request.data?.banned === true;
    if (!targetUid) throw new HttpsError("invalid-argument", "Target UID is required.");
    if (targetUid === request.auth.uid) throw new HttpsError("failed-precondition", "Administrators cannot ban themselves.");

    const target = await admin.auth().getUser(targetUid);
    const claims = { ...(target.customClaims || {}), banned };
    await admin.auth().updateUser(targetUid, { disabled: banned });
    await admin.auth().setCustomUserClaims(targetUid, claims);
    await admin.firestore().collection("proProfiles").doc(targetUid).set({ accountStatus: banned ? "banned" : "active" }, { merge: true });
    return { targetUid, banned };
});

exports.getGoogleCalendarAuthUrl = onCall({ secrets: [googleClientSecret] }, async (request) => {
    if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Authentication required.");
    const clientId = googleClientId.value() || process.env.GOOGLE_CLIENT_ID;
    const redirectUri = googleRedirectUri.value();
    if (!clientId || !googleClientSecret.value()) throw new HttpsError("failed-precondition", "Google Calendar OAuth is not configured.");
    const state = crypto.randomBytes(32).toString("hex");
    await admin.firestore().collection("calendarOAuthStates").doc(state).set({ uid: request.auth.uid, createdAt: new Date(), expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: "code", access_type: "offline", prompt: "consent", scope: googleCalendarScopes.value(), state });
    return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` };
});

async function handleCalendarCallback(request, response) {
    const { code, state, error } = request.query;
    if (error) return response.status(400).send(`Google authorization was denied: ${error}`);
    if (!code || !state) return response.status(400).send("Missing Google authorization parameters.");
    const stateRef = admin.firestore().collection("calendarOAuthStates").doc(String(state));
    const stateSnapshot = await stateRef.get();
    if (!stateSnapshot.exists || stateSnapshot.data().expiresAt.toDate() < new Date()) return response.status(400).send("The authorization request has expired.");
    const { uid } = stateSnapshot.data();
    await stateRef.delete();
    const clientId = googleClientId.value() || process.env.GOOGLE_CLIENT_ID;
    const redirectUri = googleRedirectUri.value();
    if (!clientId || !googleClientSecret.value()) return response.status(503).send("Google Calendar OAuth is not configured.");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: String(code), client_id: clientId, client_secret: googleClientSecret.value(), redirect_uri: redirectUri, grant_type: "authorization_code" }) });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.refresh_token) return response.status(502).send("Google did not return a refresh token.");
    await admin.firestore().collection("gcalTokens").doc(uid).set({ refreshToken: tokens.refresh_token, scope: tokens.scope || "", tokenType: tokens.token_type || "Bearer", connectedAt: new Date() }, { merge: true });
    response.redirect("/pro-dashboard.html?calendar=connected");
}