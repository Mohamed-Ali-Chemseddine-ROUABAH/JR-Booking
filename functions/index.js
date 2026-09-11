const admin = require("firebase-admin");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const crypto = require("node:crypto");
const Busboy = require("busboy");

const googleClientSecret = defineSecret("GOOGLE_CLIENT_SECRET");
const googleClientId = defineString("GOOGLE_CLIENT_ID");
const googleRedirectUri = defineString("GOOGLE_REDIRECT_URI", { default: "https://jr-booking-premium.web.app/api/calendar/google/callback" });
const googleCalendarScopes = defineString("GOOGLE_CALENDAR_SCOPES", { default: "https://www.googleapis.com/auth/calendar.events" });

admin.initializeApp({ storageBucket: "jr-booking-premium.firebasestorage.app" });

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

exports.submitProfessionalApplication = onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    if (request.method === "OPTIONS") return response.status(204).send("");
    if (request.method !== "POST") return response.status(405).json({ error: "method_not_allowed" });

    let stage = "parse";
    try {
        const { fields, file } = await readProfessionalApplication(request);
        const email = String(fields.email || "").trim().toLowerCase();
        const displayName = String(fields.displayName || "").trim();
        const description = String(fields.description || "").trim();
        if (!/^\S+@\S+\.\S+$/.test(email) || !displayName || !description || !file) {
            return response.status(400).json({ error: "invalid_application" });
        }

        stage = "duplicate-check";
        const firestore = admin.firestore();
        const duplicateSnapshot = await firestore.collection("professionalRequests").where("email", "==", email).limit(10).get();
        const hasOpenApplication = duplicateSnapshot.docs.some((item) => ["awaiting-email-verification", "pending-review", "approved-awaiting-password"].includes(item.data().status));
        if (hasOpenApplication) return response.status(202).json({ status: "received" });

        const applicationId = crypto.randomUUID();
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenHash = hashToken(verificationToken);
        const storagePath = `professionalRequests/${applicationId}/${file.name}`;
        stage = "storage";
        const bucket = admin.storage().bucket();
        const storageFile = bucket.file(storagePath);
        await storageFile.save(file.buffer, { metadata: { contentType: file.contentType } });
        stage = "firestore";
        await firestore.collection("professionalRequests").doc(applicationId).set({
            email,
            displayName,
            description,
            verificationFile: { name: file.name, contentType: file.contentType, size: file.buffer.length, storagePath },
            emailVerificationStatus: "pending",
            status: "awaiting-email-verification",
            verificationTokenHash,
            verificationExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const verificationUrl = `https://jr-booking-premium.web.app/verify-professional.html?token=${verificationToken}`;
        stage = "mail";
        await queueMail({
            to: email,
            templateId: "professional-application-verification",
            subject: "Confirmez votre demande professionnelle",
            text: `Confirmez votre adresse email : ${verificationUrl}`,
            sourceId: applicationId,
            category: "professional-application"
        });
        return response.status(202).json({ status: "email_queued" });
    } catch (error) {
        console.error("Professional application failed", { stage, error: error.message });
        return response.status(500).json({ error: "application_unavailable" });
    }
});

exports.verifyProfessionalApplication = onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    const token = String(request.query.token || "");
    if (!token) return response.status(400).json({ message: "Le lien de vérification est incomplet." });
    try {
        const snapshot = await admin.firestore().collection("professionalRequests")
            .where("verificationTokenHash", "==", hashToken(token))
            .limit(1)
            .get();
        if (snapshot.empty) return response.status(400).json({ message: "Ce lien est invalide ou a déjà été utilisé." });
        const application = snapshot.docs[0];
        const data = application.data();
        if (data.verificationExpiresAt?.toDate?.() < new Date()) return response.status(410).json({ message: "Ce lien de vérification a expiré." });
        if (data.status !== "awaiting-email-verification") return response.status(200).json({ message: "Cette adresse email est déjà vérifiée." });
        await application.ref.update({ emailVerificationStatus: "verified", status: "pending-review", verificationTokenHash: null, emailVerifiedAt: new Date(), updatedAt: new Date() });
        await queueMail({ to: data.email, templateId: "professional-application-received", subject: "Votre demande est en cours d'examen", text: "Votre adresse email est confirmée. Votre demande sera examinée par notre équipe.", sourceId: application.id, category: "professional-application" });
        return response.status(200).json({ message: "Votre adresse est vérifiée. Votre demande va maintenant être examinée par l'administration." });
    } catch (error) {
        console.error("Professional verification failed", error);
        return response.status(500).json({ message: "La vérification est momentanément indisponible." });
    }
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
    if (application.status !== "approved" || application.emailVerificationStatus !== "verified") throw new HttpsError("failed-precondition", "Verified request must be approved first.");

    let user;
    try {
        user = await admin.auth().getUserByEmail(application.email);
    } catch (error) {
        if (error.code !== "auth/user-not-found") throw error;
        user = await admin.auth().createUser({ email: application.email, emailVerified: true, displayName: application.displayName || "Professionnel" });
    }
    await admin.auth().setCustomUserClaims(user.uid, { ...(user.customClaims || {}), professional: true, role: "professional" });
    const passwordSetupUrl = await admin.auth().generatePasswordResetLink(application.email, { url: "https://jr-booking-premium.web.app/login.html?password-set=1" });
    await firestore.collection("proProfiles").doc(user.uid).set({
        owners: [user.uid],
        personalInfo: { displayName: application.displayName || user.displayName || "Professionnel" },
        accountStatus: "active",
        createdAt: new Date()
    }, { merge: true });
    await firestore.collection("publicProfiles").doc(user.uid).set({
        owners: [user.uid],
        displayName: application.displayName || user.displayName || "Professionnel",
        name: application.displayName || user.displayName || "Professionnel",
        shortDescription: application.description || "",
        categories: [],
        visibleFields: { displayName: true, shortDescription: true, categories: true },
        updatedAt: new Date()
    }, { merge: true });
    await queueMail({ to: application.email, templateId: "professional-account-approved", subject: "Votre compte professionnel est approuvé", text: `Votre compte est approuvé. Définissez votre mot de passe ici : ${passwordSetupUrl}`, sourceId: requestId, category: "professional-application" });
    await requestRef.update({ status: "approved-awaiting-password", authUid: user.uid, passwordSetupExpiresAt: new Date(Date.now() + 60 * 60 * 1000), provisionedAt: new Date(), provisionedBy: request.auth.uid });

    return { requestId, authUid: user.uid, status: "approved-awaiting-password" };
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

exports.syncGoogleCalendar = onCall({ secrets: [googleClientSecret] }, async (request) => {
    if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Authentication required.");

    const from = parseCalendarDate(request.data?.from, new Date());
    const to = parseCalendarDate(request.data?.to, new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000));
    if (!from || !to || to <= from || to - from > 31 * 24 * 60 * 60 * 1000) {
        throw new HttpsError("invalid-argument", "Calendar range must be between one and thirty-one days.");
    }

    const tokenSnapshot = await admin.firestore().collection("gcalTokens").doc(request.auth.uid).get();
    if (!tokenSnapshot.exists || !tokenSnapshot.data()?.refreshToken) {
        throw new HttpsError("failed-precondition", "Google Calendar is not connected.");
    }

    const accessToken = await refreshGoogleAccessToken(tokenSnapshot.data().refreshToken);
    const params = new URLSearchParams({
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "250",
        fields: "items(id,summary,status,start,end,transparency,htmlLink)"
    });
    const eventsResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const events = await eventsResponse.json();
    if (!eventsResponse.ok) {
        throw new HttpsError("failed-precondition", "Google Calendar events could not be loaded.");
    }

    const profileSnapshot = await admin.firestore().collection("proProfiles").doc(request.auth.uid).get();
    const presentationMode = profileSnapshot.data()?.calendarSettings?.mode === "solid" ? "solid" : "ghost";
    return {
        events: (events.items || []).filter((event) => event.status !== "cancelled").map((event) => ({
            id: event.id,
            title: String(event.summary || "Google Calendar"),
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            allDay: Boolean(event.start?.date),
            presentationMode,
            htmlLink: event.htmlLink || ""
        }))
    };
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

function parseCalendarDate(value, fallback) {
    const date = value ? new Date(value) : fallback;
    return Number.isNaN(date.getTime()) ? null : date;
}

async function refreshGoogleAccessToken(refreshToken) {
    const clientId = googleClientId.value() || process.env.GOOGLE_CLIENT_ID;
    if (!clientId || !googleClientSecret.value()) {
        throw new HttpsError("failed-precondition", "Google Calendar OAuth is not configured.");
    }
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: googleClientSecret.value(),
            refresh_token: refreshToken,
            grant_type: "refresh_token"
        })
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.access_token) {
        throw new HttpsError("failed-precondition", "Google Calendar authorization has expired.");
    }
    return tokens.access_token;
}

function hashToken(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
}

async function queueMail({ to, templateId, subject, text, sourceId, category }) {
    await admin.firestore().collection("mail").add({
        to,
        message: { subject, text },
        templateId,
        sourceId,
        category,
        createdAt: new Date()
    });
}

function readProfessionalApplication(request) {
    return new Promise((resolve, reject) => {
        const fields = {};
        let file;
        let fileSize = 0;
        const busboy = Busboy({ headers: request.headers, limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 3 } });
        busboy.on("field", (name, value) => { fields[name] = value; });
        busboy.on("file", (name, stream, info) => {
            const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
            if (name !== "verificationFile" || !allowedTypes.has(info.mimeType)) {
                stream.resume();
                return reject(new Error("invalid_verification_file"));
            }
            const chunks = [];
            stream.on("data", (chunk) => { fileSize += chunk.length; chunks.push(chunk); });
            stream.on("limit", () => reject(new Error("verification_file_too_large")));
            stream.on("end", () => { file = { name: info.filename.replace(/[^a-zA-Z0-9._-]/g, "_"), contentType: info.mimeType, buffer: Buffer.concat(chunks) }; });
        });
        busboy.on("finish", () => fileSize <= 10 * 1024 * 1024 ? resolve({ fields, file }) : reject(new Error("verification_file_too_large")));
        busboy.on("error", reject);
        if (request.rawBody) {
            busboy.end(request.rawBody);
        } else {
            request.pipe(busboy);
        }
    });
}