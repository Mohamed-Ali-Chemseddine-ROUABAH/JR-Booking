const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { isDigestWindow, getDigestDate, buildDigestMail } = require("./notification-digest.js");
const { defineSecret, defineString } = require("firebase-functions/params");
const crypto = require("node:crypto");
const Busboy = require("busboy");
const { BookingContactValidationError, normalizeBookingContacts } = require("./booking-contacts.js");
const { SERIES_SCOPES, getOccurrenceRange, selectBookingOccurrences } = require("./booking-series.js");
const {
    BookingClaimError,
    CLAIM_TOKEN_TTL_MS,
    MAX_CLAIM_ATTEMPTS,
    evaluateClaimConflict,
    getClaimTargetField,
    hashClaimValue,
    normalizeClaimEmail,
    validateClaimToken
} = require("./booking-claims.js");
const { normalizeBookingUpdateFields } = require("./booking-update-validation.js");

const googleClientSecret = defineSecret("GOOGLE_CLIENT_SECRET");
const googleClientId = defineString("GOOGLE_CLIENT_ID");
const googleRedirectUri = defineString("GOOGLE_REDIRECT_URI", { default: "https://jr-booking-premium.web.app/api/calendar/google/callback" });
const googleCalendarScopes = defineString("GOOGLE_CALENDAR_SCOPES", { default: "https://www.googleapis.com/auth/calendar.events" });
const bookingClaimBaseUrl = defineString("BOOKING_CLAIM_BASE_URL", { default: "https://jr-booking-premium.web.app/claim-booking.html" });

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

exports.createBookingNotification = onDocumentWritten("bookings/{bookingId}", async (event) => {
    const before = event.data.before.exists ? event.data.before.data() : null;
    const after = event.data.after.exists ? event.data.after.data() : null;
    if (!after) return;
    const bookingId = event.params.bookingId;
    const changes = !before || ["status", "start", "end", "service", "customPrice"].some((field) => JSON.stringify(after[field]) !== JSON.stringify(before[field]));
    if (!changes) return;
    const type = !before ? "booking-created" : after.status !== before.status ? `booking-${after.status || "updated"}` : "booking-updated";
    const professionalRecipients = await resolveProfessionalRecipientUids(after.proId, "manageBookings");
    const recipients = [...new Set([...professionalRecipients, after.clientId].filter(Boolean))];
    await Promise.all(recipients.map((uid) => admin.firestore().collection("notifications").doc(uid).collection("items").doc(`${bookingId}-${type}`).set({
        type,
        bookingId,
        proId: after.proId || null,
        status: after.status || null,
        title: type === "booking-created" ? "Nouvelle réservation" : "Réservation mise à jour",
        body: `La réservation ${bookingId} nécessite votre attention.`,
        createdAt: new Date(),
        readAt: null
    }, { merge: true })));
    await Promise.all(recipients.map((uid) => queueConfiguredNotificationEmail({
        recipientUid: uid,
        preferenceField: "bookingEmail",
        notificationId: `${bookingId}-${type}`,
        booking: after,
        fallbackEmail: uid === after.clientId ? getPrimaryBookingContactEmail(after) : "",
        templateId: "booking-change",
        subject: "Mise à jour de votre réservation",
        text: `La réservation ${bookingId} a été mise à jour (${after.status || "modifiée"}).`,
        category: "booking-change"
    })));
});

exports.createMessageNotification = onDocumentWritten("bookings/{bookingId}/messages/{messageId}", async (event) => {
    if (event.data.before.exists || !event.data.after.exists) return;
    const message = event.data.after.data();
    const bookingSnapshot = await admin.firestore().collection("bookings").doc(event.params.bookingId).get();
    if (!bookingSnapshot.exists) return;
    const booking = bookingSnapshot.data();
    const recipients = message.senderRole === "professional"
        ? [booking.clientId].filter(Boolean)
        : await resolveProfessionalRecipientUids(booking.proId, "manageMessages");
    await Promise.all([...new Set(recipients)].map((recipientUid) => admin.firestore().collection("notifications").doc(recipientUid).collection("items").doc(`message-${event.params.bookingId}-${event.params.messageId}`).set({
        type: "booking-message",
        bookingId: event.params.bookingId,
        messageId: event.params.messageId,
        proId: booking.proId || null,
        title: "Nouveau message",
        body: String(message.body || "").slice(0, 160),
        createdAt: new Date(),
        readAt: null
    })));
});

exports.notifyWaitlistOnBookingRelease = onDocumentWritten("bookings/{bookingId}", async (event) => {
    const before = event.data.before.exists ? event.data.before.data() : null;
    const after = event.data.after.exists ? event.data.after.data() : null;
    if (!before || !after || !["rejected", "cancelled"].includes(after.status) || before.status === after.status) return;
    const entries = await admin.firestore().collection("waitlistEntries").doc(after.proId).collection("entries").where("start", "==", after.start).where("end", "==", after.end).where("notified", "==", false).limit(25).get();
    await Promise.all(entries.docs.map(async (entry) => {
        const data = entry.data();
        if (!data.clientId) return;
        await admin.firestore().collection("notifications").doc(data.clientId).collection("items").doc(`waitlist-${event.params.bookingId}-${entry.id}`).set({ type: "waitlist-slot-opened", bookingId: event.params.bookingId, proId: after.proId, title: "Un créneau s'est libéré", body: "Un créneau correspondant à votre liste d'attente est disponible.", createdAt: new Date(), readAt: null });
        await entry.ref.update({ notified: true, notifiedAt: new Date() });
    }));
});

exports.calendarReminderWorker = onSchedule({ schedule: "every 15 minutes", timeZone: "Europe/Paris" }, async () => {
    const now = new Date();
    const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const bookings = await admin.firestore().collection("bookings").where("status", "==", "accepted").where("start", ">=", now.toISOString()).where("start", "<=", horizon.toISOString()).limit(250).get();
    for (const bookingDocument of bookings.docs) {
        const booking = bookingDocument.data();
        const profileSnapshot = await admin.firestore().collection("proProfiles").doc(booking.proId).get();
        const reminderMinutes = Number(profileSnapshot.data()?.calendarSettings?.reminderMinutes || 0);
        if (!reminderMinutes) continue;
        const start = new Date(booking.start);
        const minutesUntilStart = (start.getTime() - now.getTime()) / 60000;
        if (minutesUntilStart < reminderMinutes - 7.5 || minutesUntilStart > reminderMinutes + 7.5) continue;
        const contactEmail = getPrimaryBookingContactEmail(booking) || booking.clientEmail || "";
        const recipientUid = booking.clientId || "";
        const email = await resolveRecipientEmail(recipientUid, contactEmail);
        if (!email) continue;
        const preferenceSnapshot = recipientUid ? await admin.firestore().collection("notificationPreferences").doc(recipientUid).get() : null;
        const reminderMode = preferenceSnapshot?.data()?.reminderEmail || "immediate";
        const bookingRef = bookingDocument.ref;
        const claimed = await admin.firestore().runTransaction(async (transaction) => {
            const latest = await transaction.get(bookingRef);
            if (latest.data()?.calendarReminderQueuedAt) return false;
            transaction.update(bookingRef, { calendarReminderQueuedAt: now });
            return true;
        });
        if (!claimed) continue;
        const notificationRef = admin.firestore().collection("notifications").doc(recipientUid || `guest-${bookingDocument.id}`).collection("items").doc(`reminder-${bookingDocument.id}`);
        await notificationRef.set({
            type: "booking-reminder",
            bookingId: bookingDocument.id,
            proId: booking.proId || null,
            title: "Rappel de réservation",
            body: `Votre réservation commence le ${start.toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}.`,
            createdAt: now,
            readAt: null
        }, { merge: true });
        if (reminderMode === "immediate") {
            await queueMail({
                mailId: `reminder-${bookingDocument.id}`,
                to: email,
                templateId: "calendar-booking-reminder",
                subject: "Rappel de votre réservation",
                text: `Votre réservation commence le ${start.toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}.`,
                sourceId: bookingDocument.id,
                category: "booking-reminder"
            });
        }
    }
});

exports.dailyMessageDigestWorker = onSchedule({ schedule: "every 15 minutes", timeZone: "Europe/Paris" }, async () => {
    const now = new Date();
    if (!isDigestWindow(now)) return;
    const digestDate = getDigestDate(now);
    const digestPreferenceFields = ["messageEmail", "bookingEmail", "reminderEmail"];
    const preferenceSnapshots = await Promise.all(digestPreferenceFields.map((field) => admin.firestore().collection("notificationPreferences").where(field, "==", "digest").limit(500).get()));
    const digestPreferences = new Map();
    preferenceSnapshots.forEach((snapshot, index) => snapshot.docs.forEach((document) => {
        const current = digestPreferences.get(document.id) || new Set();
        current.add(digestPreferenceFields[index]);
        digestPreferences.set(document.id, current);
    }));
    const bookingTypes = ["booking-created", "booking-pending", "booking-accepted", "booking-rejected", "booking-done", "booking-no-show", "booking-cancelled", "booking-updated"];
    for (const [recipientUid, preferences] of digestPreferences) {
        const digestTypes = [];
        if (preferences.has("messageEmail")) digestTypes.push("booking-message");
        if (preferences.has("bookingEmail")) digestTypes.push(...bookingTypes);
        if (preferences.has("reminderEmail")) digestTypes.push("booking-reminder");
        const notificationSnapshot = await admin.firestore().collection("notifications").doc(recipientUid).collection("items")
            .where("type", "in", [...new Set(digestTypes)])
            .limit(50)
            .get();
        const pending = notificationSnapshot.docs.filter((notification) => {
            const data = notification.data();
            return !data.readAt && data.digestQueuedFor !== digestDate;
        });
        if (!pending.length) continue;

        const user = await admin.auth().getUser(recipientUid).catch(() => null);
        if (!user?.email) continue;
        const claimed = [];
        for (const notification of pending) {
            const wasClaimed = await admin.firestore().runTransaction(async (transaction) => {
                const latest = await transaction.get(notification.ref);
                if (!latest.exists || latest.data()?.readAt || latest.data()?.digestQueuedFor === digestDate) return false;
                transaction.update(notification.ref, { digestQueuedFor: digestDate, digestQueuedAt: now });
                return true;
            });
            if (wasClaimed) claimed.push(notification.data());
        }
        if (!claimed.length) continue;

        const digest = buildDigestMail(claimed, digestDate);
        await queueMail({
            to: user.email,
            templateId: "booking-message-digest",
            subject: digest.subject,
            text: digest.text,
            sourceId: `${recipientUid}/${digestDate}`,
            category: "booking-message-digest"
        });
    }
});

exports.recordHistoryShareAudit = onDocumentWritten("clientRelationships/{relationshipId}", async (event) => {
    const before = event.data.before.exists ? event.data.before.data() : null;
    const after = event.data.after.exists ? event.data.after.data() : null;
    if (!after) return;

    const logs = admin.firestore().collection("logs");
    const base = { relationshipId: event.params.relationshipId, actorRole: "client", outcome: "success", at: new Date() };

    if (!before) {
        await logs.add({ ...base, type: "history-share-requested", actorUid: after.requesterUid, metadata: { recipientUid: after.recipientUid, scope: after.scope, bookingId: after.bookingId || null, proId: after.proId || null } });
        return;
    }
    if (before.status === "pending" && after.status === "active") {
        await logs.add({ ...base, type: "history-share-approved", actorUid: after.recipientUid, metadata: { requesterUid: after.requesterUid, scope: after.scope } });
        return;
    }
    if (before.status !== "revoked" && after.status === "revoked") {
        await logs.add({ ...base, type: "history-share-revoked", actorUid: after.revokedBy, metadata: { requesterUid: after.requesterUid, recipientUid: after.recipientUid, scope: after.scope } });
    }
});

exports.calendarAuthCallback = onRequest({ secrets: [googleClientSecret] }, (request, response) => {
    handleCalendarCallback(request, response).catch((error) => {
        console.error(error);
        response.status(500).send("Google Calendar authorization could not be completed.");
    });
});

exports.calendarWebhook = onRequest(async (request, response) => {
    const channelId = String(request.get("x-goog-channel-id") || "");
    const channelToken = String(request.get("x-goog-channel-token") || "");
    if (!channelId || !channelToken) return response.status(400).send("Missing Google Calendar channel headers.");
    const tokenSnapshot = await admin.firestore().collection("gcalTokens").where("calendarChannelId", "==", channelId).limit(1).get();
    if (tokenSnapshot.empty || tokenSnapshot.docs[0].data().calendarChannelToken !== channelToken) return response.status(401).send("Unknown Google Calendar channel.");
    const tokenRef = tokenSnapshot.docs[0].ref;
    await tokenRef.set({ calendarLastWebhookAt: new Date(), calendarResourceState: request.get("x-goog-resource-state") || "exists" }, { merge: true });
    await admin.firestore().collection("logs").add({ type: "calendar-webhook-refresh-requested", at: new Date(), outcome: "success", metadata: { channelId, resourceState: request.get("x-goog-resource-state") || "exists" } });
    return response.status(204).send("");
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

exports.issueAccountRecovery = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const targetUid = String(request.data?.targetUid || "").trim();
    const targetEmail = String(request.data?.targetEmail || "").trim().toLowerCase();
    if (!targetUid && !targetEmail) throw new HttpsError("invalid-argument", "Target UID or email is required.");
    const wipeLinkedData = request.data?.wipeLinkedData === true;
    const confirmation = String(request.data?.confirmation || "").trim();
    if (wipeLinkedData && confirmation !== "EFFACER TOUTES LES DONNEES") {
        throw new HttpsError("failed-precondition", "Exact wipe confirmation is required.");
    }
    const target = targetUid ? await admin.auth().getUser(targetUid) : await admin.auth().getUserByEmail(targetEmail);
    if (wipeLinkedData) await wipeLinkedAccountData(target.uid);
    const resetUrl = await admin.auth().generatePasswordResetLink(target.email, { url: "https://jr-booking-premium.web.app/login.html?password-set=1" });
    await queueMail({
        to: target.email,
        templateId: "admin-account-recovery",
        subject: "Récupération de votre accès JR Booking Premium",
        text: `Un administrateur a demandé un nouveau lien d'accès. Définissez votre mot de passe ici : ${resetUrl}`,
        sourceId: target.uid,
        category: "account-recovery"
    });
    await admin.firestore().collection("logs").add({
        type: "account-recovery-issued",
        at: new Date(),
        actorUid: request.auth.uid,
        actorRole: "admin",
        outcome: "success",
        metadata: { targetUid: target.uid, preservedData: !wipeLinkedData, wipedLinkedData: wipeLinkedData }
    });
    return { targetUid: target.uid, email: target.email, preservedData: !wipeLinkedData, wipedLinkedData: wipeLinkedData, status: "email_queued" };
});

async function wipeLinkedAccountData(targetUid) {
    const firestore = admin.firestore();
    const profileSnapshot = await firestore.collection("proProfiles").where("owners", "array-contains", targetUid).get();
    const profileIds = [...new Set([targetUid, ...profileSnapshot.docs.map((document) => document.id)])];
    const bookingSnapshots = await Promise.all([
        firestore.collection("bookings").where("clientId", "==", targetUid).get(),
        ...profileIds.map((profileId) => firestore.collection("bookings").where("proId", "==", profileId).get())
    ]);
    const bookingIds = [...new Set(bookingSnapshots.flatMap((snapshot) => snapshot.docs.map((document) => document.id)))];
    await Promise.all(bookingIds.map((bookingId) => firestore.recursiveDelete(firestore.collection("bookings").doc(bookingId))));

    const relationshipSnapshots = await Promise.all([
        firestore.collection("clientRelationships").where("requesterUid", "==", targetUid).get(),
        firestore.collection("clientRelationships").where("recipientUid", "==", targetUid).get(),
        firestore.collection("proClientRecords").where("clientId", "==", targetUid).get()
    ]);
    await Promise.all(relationshipSnapshots.flatMap((snapshot) => snapshot.docs.map((document) => document.ref.delete())));
    await Promise.all([
        firestore.collection("clientAccounts").doc(targetUid).delete(),
        firestore.collection("notificationPreferences").doc(targetUid).delete(),
        firestore.collection("gcalTokens").doc(targetUid).delete(),
        firestore.recursiveDelete(firestore.collection("notifications").doc(targetUid))
    ]);
    await Promise.all(profileIds.map((profileId) => Promise.all([
        firestore.recursiveDelete(firestore.collection("busySlots").doc(profileId)),
        firestore.collection("publicProfiles").doc(profileId).delete(),
        firestore.collection("proProfiles").doc(profileId).delete()
    ])));

    const waitlistSnapshot = await firestore.collectionGroup("entries").where("clientId", "==", targetUid).get();
    await Promise.all(waitlistSnapshot.docs.map((document) => document.ref.delete()));
}

exports.createAdditionalProfessionalProfile = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const ownerUid = String(request.data?.ownerUid || "").trim();
    const displayName = String(request.data?.displayName || "").trim();
    const description = String(request.data?.description || "").trim();
    if (!ownerUid || !displayName) throw new HttpsError("invalid-argument", "Owner UID and display name are required.");
    const owner = await admin.auth().getUser(ownerUid);
    if (owner.customClaims?.professional !== true) throw new HttpsError("failed-precondition", "Owner must be a professional.");
    const profileId = crypto.randomUUID();
    const firestore = admin.firestore();
    await firestore.collection("proProfiles").doc(profileId).set({ owners: [ownerUid], personalInfo: { displayName }, accountStatus: "active", createdAt: new Date(), createdBy: request.auth.uid });
    await firestore.collection("publicProfiles").doc(profileId).set({ owners: [ownerUid], displayName, name: displayName, shortDescription: description, categories: [], visibleFields: { displayName: true, shortDescription: true, categories: true }, updatedAt: new Date() });
    await firestore.collection("logs").add({ type: "professional-profile-created", at: new Date(), actorUid: request.auth.uid, actorRole: "admin", outcome: "success", metadata: { profileId, ownerUid } });
    return { profileId, ownerUid, displayName };
});

exports.addProfessionalDelegate = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    const profileId = String(request.data?.profileId || "").trim();
    const email = String(request.data?.email || "").trim().toLowerCase();
    const permissions = Array.isArray(request.data?.permissions) ? request.data.permissions : [];
    if (!profileId || !/^\S+@\S+\.\S+$/.test(email) || !permissions.length || permissions.some((permission) => !["manageBookings", "manageMessages"].includes(permission))) {
        throw new HttpsError("invalid-argument", "A profile, email, and valid delegate permissions are required.");
    }
    const firestore = admin.firestore();
    const profileRef = firestore.collection("proProfiles").doc(profileId);
    const profileSnapshot = await profileRef.get();
    const profile = profileSnapshot.data() || {};
    if (!profileSnapshot.exists || !(profileId === actorUid || profile.owners?.includes(actorUid))) throw new HttpsError("permission-denied", "Profile ownership required.");
    let delegate;
    try {
        delegate = await admin.auth().getUserByEmail(email);
    } catch (error) {
        if (error.code === "auth/user-not-found") throw new HttpsError("not-found", "Delegate account not found.");
        throw error;
    }
    if (delegate.uid === actorUid || profile.owners?.includes(delegate.uid)) throw new HttpsError("invalid-argument", "An owner cannot be added as a delegate.");
    const now = new Date();
    const delegates = { ...(profile.delegates || {}), [delegate.uid]: { email, displayName: delegate.displayName || email, permissions: [...new Set(permissions)], status: "active", addedAt: profile.delegates?.[delegate.uid]?.addedAt || now, updatedAt: now } };
    await profileRef.update({ delegates });
    const delegateProfileIds = [...new Set([...(delegate.customClaims?.delegateProfileIds || []), profileId])].slice(0, 20);
    const claims = { ...(delegate.customClaims || {}), role: "professional", delegate: true, delegateProfileIds };
    delete claims.delegateProfileId;
    await admin.auth().setCustomUserClaims(delegate.uid, claims);
    await firestore.collection("logs").add({ type: "professional-delegate-added", at: now, actorUid, actorRole: "professional", outcome: "success", metadata: { profileId, delegateUid: delegate.uid, permissions: [...new Set(permissions)] } });
    return { profileId, delegateUid: delegate.uid, permissions: [...new Set(permissions)], status: "active" };
});

exports.removeProfessionalDelegate = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    const profileId = String(request.data?.profileId || "").trim();
    const delegateUid = String(request.data?.delegateUid || "").trim();
    const firestore = admin.firestore();
    const profileRef = firestore.collection("proProfiles").doc(profileId);
    const profileSnapshot = await profileRef.get();
    const profile = profileSnapshot.data() || {};
    if (!profileSnapshot.exists || !(profileId === actorUid || profile.owners?.includes(actorUid))) throw new HttpsError("permission-denied", "Profile ownership required.");
    if (!profile.delegates?.[delegateUid]) throw new HttpsError("not-found", "Delegate not found.");
    const delegates = { ...(profile.delegates || {}) };
    delete delegates[delegateUid];
    await profileRef.update({ delegates });
    const delegate = await admin.auth().getUser(delegateUid);
    const claims = { ...(delegate.customClaims || {}) };
    const delegateProfileIds = (claims.delegateProfileIds || []).filter((assignedProfileId) => assignedProfileId !== profileId);
    if (delegateProfileIds.length) {
        claims.delegateProfileIds = delegateProfileIds;
        claims.delegate = true;
    } else {
        delete claims.delegate;
        delete claims.delegateProfileIds;
        delete claims.delegateProfileId;
        if (claims.role === "professional" && !claims.professional) delete claims.role;
    }
    await admin.auth().setCustomUserClaims(delegateUid, claims);
    await firestore.collection("logs").add({ type: "professional-delegate-removed", at: new Date(), actorUid, actorRole: "professional", outcome: "success", metadata: { profileId, delegateUid } });
    return { profileId, delegateUid, status: "removed" };
});

exports.listDelegatedBookings = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    const profileId = String(request.data?.profileId || "").trim();
    if (!profileId) throw new HttpsError("invalid-argument", "Profile ID is required.");
    const profileSnapshot = await admin.firestore().collection("proProfiles").doc(profileId).get();
    const delegate = profileSnapshot.data()?.delegates?.[actorUid];
    if (!profileSnapshot.exists || delegate?.status !== "active") throw new HttpsError("permission-denied", "Active delegation required.");
    const permissions = [...new Set((delegate.permissions || []).filter((permission) => ["manageBookings", "manageMessages"].includes(permission)))];
    if (!permissions.length) throw new HttpsError("permission-denied", "Delegate permission required.");
    const snapshot = await admin.firestore().collection("bookings").where("proId", "==", profileId).limit(500).get();
    return {
        profileId,
        displayName: profileSnapshot.data()?.personalInfo?.displayName || profileSnapshot.data()?.displayName || "Profil délégué",
        permissions,
        bookings: snapshot.docs.map((bookingDocument) => sanitizeDelegatedBooking(bookingDocument.id, bookingDocument.data()))
    };
});

exports.batchUpdateBookingStatus = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    const bookingIds = [...new Set((Array.isArray(request.data?.bookingIds) ? request.data.bookingIds : []).map((id) => String(id).trim()).filter(Boolean))];
    const status = String(request.data?.status || "").trim();
    if (!bookingIds.length || bookingIds.length > 50 || !["pending", "accepted", "rejected", "done", "no-show"].includes(status)) {
        throw new HttpsError("invalid-argument", "Use 1 to 50 booking IDs and a valid status.");
    }
    const firestore = admin.firestore();
    await firestore.runTransaction(async (transaction) => {
        const snapshots = await Promise.all(bookingIds.map((bookingId) => transaction.get(firestore.collection("bookings").doc(bookingId))));
        for (const snapshot of snapshots) {
            if (!snapshot.exists) throw new HttpsError("not-found", "Booking not found.");
            const booking = snapshot.data();
            const authorized = request.auth.token.admin
                || booking.proId === actorUid
                || await isProfessionalProfileOwner(booking.proId, actorUid)
                || await hasServerDelegatePermission(booking.proId, actorUid, "manageBookings");
            if (!authorized) throw new HttpsError("permission-denied", "Booking management permission required.");
        }
        const statusEntry = { status, at: new Date().toISOString() };
        snapshots.forEach((snapshot) => transaction.update(snapshot.ref, { status, statusHistory: FieldValue.arrayUnion(statusEntry) }));
    });
    return { updated: bookingIds.length, status };
});

exports.scheduleProfessionalProfileErasure = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const profileId = String(request.data?.profileId || "").trim();
    if (String(request.data?.confirmation || "") !== "SUPPRIMER CE PROFIL") throw new HttpsError("failed-precondition", "Typed confirmation is required.");
    if (!profileId) throw new HttpsError("invalid-argument", "Profile ID is required.");
    const profileRef = admin.firestore().collection("proProfiles").doc(profileId);
    const profileSnapshot = await profileRef.get();
    if (!profileSnapshot.exists) throw new HttpsError("not-found", "Professional profile not found.");
    const profile = profileSnapshot.data();
    const scheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await profileRef.update({ accountStatus: "limbo", erasureRequest: { status: "pending", scheduledFor, requestedBy: request.auth.uid, requestedAt: new Date() } });
    const owners = Array.isArray(profile.owners) ? profile.owners : [];
    await Promise.all(owners.map(async (ownerUid) => {
        const target = await admin.auth().getUser(ownerUid);
        await admin.auth().updateUser(ownerUid, { disabled: true });
        await admin.auth().setCustomUserClaims(ownerUid, { ...(target.customClaims || {}), profileLimbo: true });
    }));
    await admin.firestore().collection("logs").add({ type: "professional-profile-erasure-scheduled", at: new Date(), actorUid: request.auth.uid, actorRole: "admin", outcome: "success", metadata: { profileId, scheduledFor } });
    return { profileId, status: "limbo", scheduledFor: scheduledFor.toISOString() };
});

exports.cancelProfessionalProfileErasure = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const profileId = String(request.data?.profileId || "").trim();
    if (!profileId) throw new HttpsError("invalid-argument", "Profile ID is required.");
    const profileRef = admin.firestore().collection("proProfiles").doc(profileId);
    const profileSnapshot = await profileRef.get();
    if (!profileSnapshot.exists) throw new HttpsError("not-found", "Professional profile not found.");
    const profile = profileSnapshot.data();
    if (profile.erasureRequest?.status !== "pending") throw new HttpsError("failed-precondition", "No pending erasure exists.");
    await profileRef.update({ accountStatus: "active", erasureRequest: { ...profile.erasureRequest, status: "cancelled", cancelledBy: request.auth.uid, cancelledAt: new Date() } });
    const owners = Array.isArray(profile.owners) ? profile.owners : [];
    await Promise.all(owners.map(async (ownerUid) => {
        const target = await admin.auth().getUser(ownerUid);
        const claims = { ...(target.customClaims || {}) };
        delete claims.profileLimbo;
        await admin.auth().updateUser(ownerUid, { disabled: false });
        await admin.auth().setCustomUserClaims(ownerUid, claims);
    }));
    await admin.firestore().collection("logs").add({ type: "professional-profile-erasure-cancelled", at: new Date(), actorUid: request.auth.uid, actorRole: "admin", outcome: "success", metadata: { profileId } });
    return { profileId, status: "active" };
});

exports.purgeProfessionalProfile = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const profileId = String(request.data?.profileId || "").trim();
    if (String(request.data?.confirmation || "") !== "SUPPRIMER DEFINITIVEMENT CE PROFIL") throw new HttpsError("failed-precondition", "Permanent typed confirmation is required.");
    if (!profileId) throw new HttpsError("invalid-argument", "Profile ID is required.");
    const firestore = admin.firestore();
    const profileRef = firestore.collection("proProfiles").doc(profileId);
    const snapshot = await profileRef.get();
    if (!snapshot.exists) throw new HttpsError("not-found", "Professional profile not found.");
    const profile = snapshot.data();
    const scheduledFor = profile.erasureRequest?.scheduledFor?.toDate ? profile.erasureRequest.scheduledFor.toDate() : new Date(profile.erasureRequest?.scheduledFor || 0);
    if (profile.accountStatus !== "limbo" || profile.erasureRequest?.status !== "pending" || scheduledFor > new Date()) throw new HttpsError("failed-precondition", "The 30-day grace period has not elapsed.");
    await profileRef.delete();
    await firestore.collection("publicProfiles").doc(profileId).delete().catch(() => {});
    const owners = Array.isArray(profile.owners) ? profile.owners : [];
    for (const ownerUid of owners) {
        const otherProfiles = await firestore.collection("proProfiles").where("owners", "array-contains", ownerUid).limit(2).get();
        if (otherProfiles.empty) await admin.auth().deleteUser(ownerUid).catch(() => {});
    }
    await firestore.collection("logs").add({ type: "professional-profile-erased", at: new Date(), actorUid: request.auth.uid, actorRole: "admin", outcome: "success", metadata: { profileId, owners, preservedBookings: true } });
    return { profileId, status: "erased", preservedBookings: true };
});

exports.listPlatformCategories = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const snapshot = await admin.firestore().collection("publicProfiles").get();
    const usage = new Map();
    snapshot.forEach((document) => {
        for (const category of document.data().categories || []) {
            const normalized = String(category).trim();
            if (normalized) usage.set(normalized, (usage.get(normalized) || 0) + 1);
        }
    });
    return { categories: [...usage.entries()].map(([name, count]) => ({ name, count })).sort((left, right) => left.name.localeCompare(right.name, "fr")) };
});

exports.renamePlatformCategory = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const from = String(request.data?.from || "").trim();
    const to = String(request.data?.to || "").trim();
    if (!from || !to || from === to) throw new HttpsError("invalid-argument", "Two different category names are required.");
    const firestore = admin.firestore();
    const snapshot = await firestore.collection("publicProfiles").get();
    const batch = firestore.batch();
    let updated = 0;
    snapshot.forEach((document) => {
        const data = document.data();
        const categories = Array.isArray(data.categories) ? data.categories : [];
        if (!categories.includes(from)) return;
        const nextCategories = [...new Set(categories.map((category) => category === from ? to : category))];
        batch.update(document.ref, { categories: nextCategories, updatedAt: new Date() });
        updated += 1;
    });
    if (updated) await batch.commit();
    await firestore.collection("logs").add({ type: "platform-category-renamed", at: new Date(), actorUid: request.auth.uid, actorRole: "admin", outcome: "success", metadata: { from, to, profilesUpdated: updated } });
    return { from, to, profilesUpdated: updated };
});

exports.moderatePublicProfile = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const profileId = String(request.data?.profileId || "").trim();
    const reason = String(request.data?.reason || "").trim();
    const redactDescription = request.data?.redactDescription === true;
    const redactAvatar = request.data?.redactAvatar === true;
    if (!profileId || !reason || (!redactDescription && !redactAvatar)) throw new HttpsError("invalid-argument", "Profile, reason, and at least one redaction are required.");
    const profileRef = admin.firestore().collection("publicProfiles").doc(profileId);
    if (!(await profileRef.get()).exists) throw new HttpsError("not-found", "Public profile not found.");
    const updates = { updatedAt: new Date(), moderation: { lastAction: "redaction", reason, actorUid: request.auth.uid, at: new Date() } };
    if (redactDescription) updates.shortDescription = "";
    if (redactAvatar) updates.avatarUrl = "";
    await profileRef.update(updates);
    await admin.firestore().collection("logs").add({ type: "public-profile-moderated", at: new Date(), actorUid: request.auth.uid, actorRole: "admin", outcome: "success", metadata: { profileId, reason, redactDescription, redactAvatar } });
    return { profileId, redacted: { description: redactDescription, avatar: redactAvatar } };
});

exports.queuePlatformBroadcast = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const audience = String(request.data?.audience || "");
    const subject = String(request.data?.subject || "").trim();
    const text = String(request.data?.text || "").trim();
    if (!["clients", "professionals", "both"].includes(audience) || !subject || !text) throw new HttpsError("invalid-argument", "Audience, subject, and message are required.");
    if (subject.length > 160 || text.length > 4000) throw new HttpsError("invalid-argument", "Broadcast content is too long.");
    const users = [];
    let pageToken;
    do {
        const page = await admin.auth().listUsers(1000, pageToken);
        users.push(...page.users.filter((user) => {
            if (!user.email || user.disabled || user.customClaims?.admin) return false;
            const isProfessional = user.customClaims?.professional === true || user.customClaims?.role === "professional";
            return audience === "both" || (audience === "professionals" && isProfessional) || (audience === "clients" && !isProfessional);
        }));
        pageToken = page.pageToken;
    } while (pageToken && users.length < 500);
    const recipients = users.slice(0, 500);
    const firestore = admin.firestore();
    const batch = firestore.batch();
    for (const user of recipients) {
        const mailRef = firestore.collection("mail").doc();
        batch.set(mailRef, { to: user.email, message: { subject, text }, templateId: "platform-broadcast", category: "platform-broadcast", sourceId: request.auth.uid, createdAt: new Date() });
    }
    if (recipients.length) await batch.commit();
    await firestore.collection("logs").add({ type: "platform-broadcast-queued", at: new Date(), actorUid: request.auth.uid, actorRole: "admin", outcome: "success", metadata: { audience, recipientCount: recipients.length, subject } });
    return { audience, recipientCount: recipients.length, status: "queued" };
});

exports.getPlatformHealthSummary = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const firestore = admin.firestore();
    const [users, professionals, clients, bookings, mail, logs] = await Promise.all([
        admin.auth().listUsers(1000),
        firestore.collection("proProfiles").get(),
        firestore.collection("clientAccounts").get(),
        firestore.collection("bookings").get(),
        firestore.collection("mail").orderBy("createdAt", "desc").limit(200).get(),
        firestore.collection("logs").orderBy("at", "desc").limit(200).get()
    ]);
    const userList = users.users;
    const failedMail = mail.docs.filter((item) => ["failed", "error"].includes(item.data().delivery?.state || item.data().status)).length;
    const failedOperations = logs.docs.filter((item) => item.data().outcome === "failure").length;
    const calendarErrors = logs.docs.filter((item) => String(item.data().type || "").includes("calendar") && item.data().outcome === "failure").length;
    return {
        professionals: professionals.size,
        clients: clients.size,
        bookings: bookings.size,
        authUsers: userList.length,
        mailQueued: mail.size,
        mailFailed: failedMail,
        privilegedFailures: failedOperations,
        calendarErrors,
        auditEvents: logs.size
    };
});

exports.bulkReviewProfessionalApplications = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const requestIds = Array.isArray(request.data?.requestIds) ? request.data.requestIds.map((id) => String(id).trim()).filter(Boolean) : [];
    const decision = String(request.data?.decision || "");
    if (!requestIds.length || requestIds.length > 25 || !["approved", "rejected"].includes(decision)) throw new HttpsError("invalid-argument", "Choose up to 25 applications and an approved/rejected decision.");
    const firestore = admin.firestore();
    const batch = firestore.batch();
    const reviewedAt = new Date();
    const reviewed = [];
    for (const requestId of requestIds) {
        const requestRef = firestore.collection("professionalRequests").doc(requestId);
        const snapshot = await requestRef.get();
        if (!snapshot.exists || snapshot.data().status !== "pending-review") continue;
        batch.update(requestRef, { status: decision, reviewedBy: request.auth.uid, reviewedAt });
        reviewed.push(requestId);
    }
    if (reviewed.length) await batch.commit();
    await firestore.collection("logs").add({ type: "professional-applications-bulk-reviewed", at: reviewedAt, actorUid: request.auth.uid, actorRole: "admin", outcome: "success", metadata: { decision, reviewedCount: reviewed.length, requestIds: reviewed } });
    return { decision, reviewedCount: reviewed.length, requestIds: reviewed };
});

exports.joinBookingWaitlist = onCall(async (request) => {
    if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Authentication required.");
    const proId = String(request.data?.proId || "").trim();
    const start = String(request.data?.start || "").trim();
    const end = String(request.data?.end || "").trim();
    if (!proId || !start || !end || new Date(end) <= new Date(start)) throw new HttpsError("invalid-argument", "Professional and valid time window are required.");
    const ref = admin.firestore().collection("waitlistEntries").doc(proId).collection("entries").doc(`${request.auth.uid}_${start.replace(/[^0-9]/g, "")}`);
    await ref.set({ clientId: request.auth.uid, proId, start, end, status: "waiting", notified: false, createdAt: new Date() }, { merge: true });
    await admin.firestore().collection("logs").add({ type: "waitlist-joined", at: new Date(), actorUid: request.auth.uid, actorRole: "client", outcome: "success", metadata: { proId, start, end } });
    return { status: "waiting", proId, start, end };
});

exports.updateBookingMeetingLinks = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    requireProfessionalRole(request);
    const bookingId = String(request.data?.bookingId || "").trim();
    const links = Array.isArray(request.data?.links) ? request.data.links : [];
    if (!bookingId || links.length > 5 || links.some((link) => !link?.label || !/^https:\/\//i.test(link.url || ""))) throw new HttpsError("invalid-argument", "Use up to five HTTPS meeting links.");
    const bookingRef = admin.firestore().collection("bookings").doc(bookingId);
    const bookingSnapshot = await bookingRef.get();
    if (!bookingSnapshot.exists || !(bookingSnapshot.data().proId === actorUid || await isProfessionalProfileOwner(bookingSnapshot.data().proId, actorUid) || await hasServerDelegatePermission(bookingSnapshot.data().proId, actorUid, "manageBookings"))) throw new HttpsError("permission-denied", "Booking ownership required.");
    const normalized = links.map((link) => ({ label: String(link.label).trim().slice(0, 80), url: String(link.url).trim().slice(0, 500) }));
    await bookingRef.update({ meetingLinks: normalized });
    await admin.firestore().collection("logs").add({ type: "booking-meeting-links-updated", at: new Date(), actorUid, actorRole: "professional", outcome: "success", metadata: { bookingId, linkCount: normalized.length } });
    return { bookingId, links: normalized };
});

exports.getBookingPrepNotes = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    const bookingId = String(request.data?.bookingId || "").trim();
    if (!bookingId) throw new HttpsError("invalid-argument", "Booking ID is required.");
    const bookingSnapshot = await admin.firestore().collection("bookings").doc(bookingId).get();
    if (!bookingSnapshot.exists) throw new HttpsError("not-found", "Booking not found.");
    const booking = bookingSnapshot.data();
    if (!request.auth.token.admin && booking.proId !== actorUid && !await isProfessionalProfileOwner(booking.proId, actorUid)) {
        throw new HttpsError("permission-denied", "Profile ownership required.");
    }
    const noteSnapshot = await bookingSnapshot.ref.collection("private").doc("professional").get();
    return { bookingId, prepNotes: String(noteSnapshot.data()?.prepNotes || "") };
});

exports.updateBookingPrepNotes = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    const bookingId = String(request.data?.bookingId || "").trim();
    const prepNotes = String(request.data?.prepNotes || "").trim().slice(0, 2000);
    if (!bookingId) throw new HttpsError("invalid-argument", "Booking ID is required.");
    const bookingSnapshot = await admin.firestore().collection("bookings").doc(bookingId).get();
    if (!bookingSnapshot.exists) throw new HttpsError("not-found", "Booking not found.");
    const booking = bookingSnapshot.data();
    if (!request.auth.token.admin && booking.proId !== actorUid && !await isProfessionalProfileOwner(booking.proId, actorUid)) {
        throw new HttpsError("permission-denied", "Profile ownership required.");
    }
    await bookingSnapshot.ref.collection("private").doc("professional").set({ prepNotes, updatedAt: new Date(), updatedBy: actorUid }, { merge: true });
    await admin.firestore().collection("logs").add({ type: "booking-prep-notes-updated", at: new Date(), actorUid, actorRole: request.auth.token.admin ? "admin" : "professional", outcome: "success", metadata: { bookingId } });
    return { bookingId, saved: true };
});

exports.sendBookingMessage = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    const bookingId = String(request.data?.bookingId || "").trim();
    const body = String(request.data?.body || "").trim();
    const notifyEmail = request.data?.notifyEmail !== false;
    if (!bookingId || !body || body.length > 4000) throw new HttpsError("invalid-argument", "A message between 1 and 4000 characters is required.");

    const firestore = admin.firestore();
    const bookingSnapshot = await firestore.collection("bookings").doc(bookingId).get();
    if (!bookingSnapshot.exists) throw new HttpsError("not-found", "Booking not found.");
    const booking = bookingSnapshot.data();
    const isProfessional = actorUid === booking.proId
        || await isProfessionalProfileOwner(booking.proId, actorUid)
        || await hasServerDelegatePermission(booking.proId, actorUid, "manageMessages");
    const isClient = actorUid === booking.clientId;
    if (!isProfessional && !isClient) throw new HttpsError("permission-denied", "Booking access required.");

    const messageRef = bookingSnapshot.ref.collection("messages").doc();
    await messageRef.set({
        senderUid: actorUid,
        senderRole: isProfessional ? "professional" : "client",
        body,
        createdAt: new Date(),
        notificationStatus: notifyEmail ? "pending" : "not-requested",
        mailId: null
    });

    const recipientUid = isProfessional ? booking.clientId : booking.proId;
    const recipientEmail = await resolveBookingMessageRecipient(booking, isProfessional);
    const preferenceSnapshot = recipientUid ? await firestore.collection("notificationPreferences").doc(recipientUid).get() : null;
    const messageEmailMode = preferenceSnapshot?.data()?.messageEmail || "immediate";
    const emailAllowed = messageEmailMode === "immediate";
    if (!notifyEmail || !recipientEmail || !emailAllowed) {
        await messageRef.update({ notificationStatus: "not-requested" });
        return { bookingId, messageId: messageRef.id, notificationStatus: "not-requested" };
    }

    try {
        const mailId = await queueMail({
            to: recipientEmail,
            templateId: "booking-message",
            subject: "Nouveau message concernant votre réservation",
            text: body.slice(0, 500),
            sourceId: `${bookingId}/${messageRef.id}`,
            category: "booking-message"
        });
        await messageRef.update({ notificationStatus: "queued", mailId });
        return { bookingId, messageId: messageRef.id, notificationStatus: "queued" };
    } catch (error) {
        console.error("Booking message notification failed", { bookingId, messageId: messageRef.id, error: error.message });
        await messageRef.update({ notificationStatus: "failed" });
        return { bookingId, messageId: messageRef.id, notificationStatus: "failed" };
    }
});

async function readCurrentLegalVersions() {
    const snapshot = await admin.firestore().doc("platformConfig/legal").get();
    const data = snapshot.exists ? snapshot.data() : {};
    return {
        termsVersion: String(data.termsVersion || "2026-09-13"),
        privacyVersion: String(data.privacyVersion || "2026-09-13")
    };
}

exports.getCurrentLegalVersions = onCall(async () => readCurrentLegalVersions());

exports.recordLegalAcceptance = onCall(async (request) => {
    if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Authentication required.");
    const termsVersion = String(request.data?.termsVersion || "");
    const privacyVersion = String(request.data?.privacyVersion || "");
    const sourceFlow = String(request.data?.sourceFlow || "client-registration");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(termsVersion) || !/^\d{4}-\d{2}-\d{2}$/.test(privacyVersion)) {
        throw new HttpsError("invalid-argument", "Legal versions must use YYYY-MM-DD.");
    }
    const current = await readCurrentLegalVersions();
    if (termsVersion !== current.termsVersion || privacyVersion !== current.privacyVersion) {
        throw new HttpsError("failed-precondition", "Current legal versions must be accepted.");
    }
    const acceptedAt = new Date();
    await admin.firestore().collection("legalAcceptances").add({
        uid: request.auth.uid,
        termsVersion,
        termsAcceptedAt: acceptedAt,
        privacyVersion,
        privacyAcceptedAt: acceptedAt,
        sourceFlow,
        createdAt: acceptedAt
    });
    return { termsVersion, privacyVersion };
});

exports.createProfessionalCreationLink = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const email = String(request.data?.email || "").trim().toLowerCase();
    const maxUses = Number(request.data?.maxUses || 1);
    const expiresInDays = Number(request.data?.expiresInDays || 7);
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpsError("invalid-argument", "A valid email is required.");
    if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 25) throw new HttpsError("invalid-argument", "Usage cap must be between 1 and 25.");
    if (!Number.isInteger(expiresInDays) || expiresInDays < 1 || expiresInDays > 90) throw new HttpsError("invalid-argument", "Expiry must be between 1 and 90 days.");
    const rawToken = crypto.randomBytes(32).toString("base64url");
    const linkId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    await admin.firestore().collection("creationLinks").doc(linkId).set({
        email,
        tokenHash: hashToken(rawToken),
        status: "active",
        maxUses,
        remainingUses: maxUses,
        createdBy: request.auth.uid,
        createdAt: new Date(),
        expiresAt,
        redeemedProfiles: []
    });
    return { linkId, url: `https://jr-booking-premium.web.app/register-professional.html?token=${encodeURIComponent(rawToken)}`, email, maxUses, expiresAt: expiresAt.toISOString() };
});

exports.revokeProfessionalCreationLink = onCall(async (request) => {
    if (!request.auth?.token?.admin) throw new HttpsError("permission-denied", "Administrator claim required.");
    const linkId = String(request.data?.linkId || "");
    if (!linkId) throw new HttpsError("invalid-argument", "Link ID is required.");
    const linkRef = admin.firestore().collection("creationLinks").doc(linkId);
    const snapshot = await linkRef.get();
    if (!snapshot.exists) throw new HttpsError("not-found", "Creation link not found.");
    await linkRef.update({ status: "revoked", revokedAt: new Date(), revokedBy: request.auth.uid });
    return { linkId, status: "revoked" };
});

exports.redeemProfessionalCreationLink = onCall(async (request) => {
    const token = String(request.data?.token || "");
    const password = String(request.data?.password || "");
    const displayName = String(request.data?.displayName || "Professionnel").trim();
    if (!token || password.length < 6 || !displayName) throw new HttpsError("invalid-argument", "Token, password, and display name are required.");
    const linkSnapshot = await admin.firestore().collection("creationLinks").where("tokenHash", "==", hashToken(token)).limit(1).get();
    if (linkSnapshot.empty) throw new HttpsError("permission-denied", "Creation link is invalid.");
    const linkRef = linkSnapshot.docs[0].ref;
    const link = linkSnapshot.docs[0].data();
    const expiresAt = link.expiresAt?.toDate ? link.expiresAt.toDate() : new Date(link.expiresAt);
    if (link.status !== "active" || link.remainingUses < 1 || expiresAt <= new Date()) throw new HttpsError("failed-precondition", "Creation link is expired or exhausted.");
    let user;
    try {
        user = await admin.auth().getUserByEmail(link.email);
        await admin.auth().updateUser(user.uid, { password, displayName, disabled: false });
    } catch (error) {
        if (error.code !== "auth/user-not-found") throw error;
        user = await admin.auth().createUser({ email: link.email, password, displayName, emailVerified: true });
    }
    await admin.auth().setCustomUserClaims(user.uid, { ...(user.customClaims || {}), professional: true, role: "professional" });
    const firestore = admin.firestore();
    await firestore.collection("proProfiles").doc(user.uid).set({ owners: [user.uid], personalInfo: { displayName }, accountStatus: "active", createdAt: new Date() }, { merge: true });
    await firestore.collection("publicProfiles").doc(user.uid).set({ owners: [user.uid], displayName, name: displayName, shortDescription: "", categories: [], visibleFields: { displayName: true, shortDescription: true, categories: true }, updatedAt: new Date() }, { merge: true });
    const remainingUses = link.remainingUses - 1;
    await linkRef.update({ remainingUses, status: remainingUses === 0 ? "exhausted" : "active", redeemedProfiles: FieldValue.arrayUnion({ uid: user.uid, at: new Date() }) });
    return { uid: user.uid, email: link.email, status: "completed" };
});

exports.createProfessionalBooking = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    requireProfessionalRole(request);
    const proId = String(request.data?.proId || actorUid);
    const requestId = normalizeRequestId(request.data?.requestId);
    const { start, end } = validateBookingRange(request.data?.start, request.data?.end);
    const contacts = getValidatedContacts(request.data?.contacts);
    const firestore = admin.firestore();
    const bookingId = hashToken(`${actorUid}:${requestId}`).slice(0, 40);
    const bookingRef = firestore.collection("bookings").doc(bookingId);

    await firestore.runTransaction(async (transaction) => {
        await requireProfessionalOwnership(transaction, proId, actorUid);
        const existing = await transaction.get(bookingRef);
        if (existing.exists) {
            if (existing.data().createdBy !== actorUid) throw new HttpsError("already-exists", "Booking request ID is already in use.");
            return;
        }

        const storedContacts = contacts.map((contact, index) => ({
            ...contact,
            contactId: hashToken(`${bookingId}:${index}:${contact.email}:${contact.role}`).slice(0, 32),
            verifiedAt: null,
            linkedUid: null
        }));
        const primary = storedContacts.find((contact) => contact.role === "primary");
        transaction.create(bookingRef, {
            proId,
            clientId: null,
            serviceRecipientUid: null,
            guestContact: { name: primary.name, email: primary.email },
            contacts: storedContacts,
            claimState: "unclaimed",
            claimExpiresAt: null,
            claimConflict: null,
            start,
            end,
            status: "pending",
            createdBy: actorUid,
            createdAt: new Date()
        });
        storedContacts.forEach((contact) => {
            transaction.create(firestore.collection("logs").doc(), bookingContactAuditEvent({
                type: "booking-contact-added",
                actorUid,
                bookingId,
                contact,
                requestId
            }));
        });
    });

    return { bookingId };
});

exports.updateProfessionalBooking = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    requireProfessionalRole(request);
    const bookingId = String(request.data?.bookingId || "").trim();
    const requestId = normalizeRequestId(request.data?.requestId);
    if (!bookingId) throw new HttpsError("invalid-argument", "Booking ID is required.");
    const { start, end } = validateBookingRange(request.data?.start, request.data?.end);
    const contacts = getValidatedContacts(request.data?.contacts);
    const seriesScope = String(request.data?.seriesScope || "this");
    if (!SERIES_SCOPES.has(seriesScope)) throw new HttpsError("invalid-argument", "Invalid booking series scope.");
    let updateFields;
    try {
        updateFields = normalizeBookingUpdateFields(request.data || {});
    } catch (error) {
        throw new HttpsError("invalid-argument", error.message);
    }
    const firestore = admin.firestore();
    const bookingRef = firestore.collection("bookings").doc(bookingId);
    const operationRef = firestore.collection("logs").doc(hashToken(`booking-series:${actorUid}:${requestId}`).slice(0, 40));

    const result = await firestore.runTransaction(async (transaction) => {
        const operationSnapshot = await transaction.get(operationRef);
        if (operationSnapshot.exists) return operationSnapshot.data().metadata;
        const bookingSnapshot = await transaction.get(bookingRef);
        if (!bookingSnapshot.exists) throw new HttpsError("not-found", "Booking not found.");
        const booking = bookingSnapshot.data();
        await requireProfessionalOwnership(transaction, booking.proId, actorUid);

        const seriesSnapshot = booking.seriesId
            ? await transaction.get(firestore.collection("bookings").where("seriesId", "==", booking.seriesId))
            : null;
        const occurrenceDocuments = seriesSnapshot
            ? seriesSnapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
            : [{ id: bookingId, ...booking }];
        const eligibleOccurrences = occurrenceDocuments.filter((occurrence) => occurrence.proId === booking.proId);
        const affected = selectBookingOccurrences(eligibleOccurrences, bookingId, seriesScope);
        const affectedIds = affected.map((occurrence) => occurrence.id);
        const unaffectedIds = occurrenceDocuments.filter((occurrence) => !affectedIds.includes(occurrence.id)).map((occurrence) => occurrence.id);

        affected.forEach((occurrence) => {
            const occurrenceRef = firestore.collection("bookings").doc(occurrence.id);
            const occurrenceRange = getOccurrenceRange(occurrence, booking, start, end);
            const previousContacts = Array.isArray(occurrence.contacts) ? occurrence.contacts : [];
            const previousByKey = new Map(previousContacts.map((contact) => [`${contact.email}\u0000${contact.role}`, contact]));
            const storedContacts = contacts.map((contact, index) => {
                const previous = previousByKey.get(`${contact.email}\u0000${contact.role}`);
                return {
                    ...contact,
                    contactId: previous?.contactId || hashToken(`${occurrence.id}:${requestId}:${index}:${contact.email}:${contact.role}`).slice(0, 32),
                    verifiedAt: previous?.verifiedAt || null,
                    linkedUid: previous?.linkedUid || null
                };
            });
            const primary = storedContacts.find((contact) => contact.role === "primary");
            transaction.update(occurrenceRef, {
                contacts: storedContacts,
                guestContact: { name: primary.name, email: primary.email },
                start: occurrenceRange.start,
                end: occurrenceRange.end,
                ...updateFields
            });

            const nextByKey = new Map(storedContacts.map((contact) => [`${contact.email}\u0000${contact.role}`, contact]));
            previousContacts.forEach((contact) => {
                if (!nextByKey.has(`${contact.email}\u0000${contact.role}`)) {
                    transaction.create(firestore.collection("logs").doc(), bookingContactAuditEvent({ type: "booking-contact-removed", actorUid, bookingId: occurrence.id, contact, requestId }));
                }
            });
            storedContacts.forEach((contact) => {
                const previous = previousByKey.get(`${contact.email}\u0000${contact.role}`);
                const type = !previous
                    ? "booking-contact-added"
                    : previous.name !== contact.name || previous.notify !== contact.notify
                        ? "booking-contact-updated"
                        : null;
                if (type) transaction.create(firestore.collection("logs").doc(), bookingContactAuditEvent({ type, actorUid, bookingId: occurrence.id, contact, requestId }));
            });
        });

        const metadata = { bookingId, seriesId: booking.seriesId || null, seriesScope, affectedBookingIds: affectedIds, unaffectedBookingIds: unaffectedIds };
        transaction.create(operationRef, {
            type: "booking-series-modified",
            at: new Date(),
            actorUid,
            actorRole: "professional",
            outcome: "success",
            bookingId,
            seriesId: booking.seriesId || null,
            requestId,
            metadata
        });
        return metadata;
    });

    return result;
});

exports.issueBookingClaim = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    requireProfessionalRole(request);
    const bookingId = String(request.data?.bookingId || "").trim();
    const contactId = String(request.data?.contactId || "").trim();
    const requestId = normalizeRequestId(request.data?.requestId);
    if (!bookingId || !contactId) throw new HttpsError("invalid-argument", "Booking and contact IDs are required.");

    const firestore = admin.firestore();
    const bookingRef = firestore.collection("bookings").doc(bookingId);
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashClaimValue(rawToken);
    const tokenRef = firestore.collection("bookingClaimTokens").doc(tokenHash);
    const expiresAt = new Date(Date.now() + CLAIM_TOKEN_TTL_MS);

    await firestore.runTransaction(async (transaction) => {
        const bookingSnapshot = await transaction.get(bookingRef);
        if (!bookingSnapshot.exists) throw new HttpsError("not-found", "Booking not found.");
        const booking = bookingSnapshot.data();
        await requireProfessionalOwnership(transaction, booking.proId, actorUid);
        const existingTokens = await transaction.get(firestore.collection("bookingClaimTokens").where("bookingId", "==", bookingId));
        const contact = booking.contacts?.find((item) => item.contactId === contactId);
        if (!contact) throw new HttpsError("not-found", "Booking contact not found.");

        existingTokens.docs
            .filter((document) => document.data().contactId === contactId && !document.data().usedAt && !document.data().revokedAt)
            .forEach((document) => transaction.update(document.ref, { revokedAt: new Date() }));
        transaction.create(tokenRef, {
            bookingId,
            contactId,
            emailHash: hashClaimValue(contact.email),
            expiresAt,
            usedAt: null,
            revokedAt: null,
            createdAt: new Date(),
            attemptCount: 0,
            conflictState: null,
            requesterUid: null
        });
        transaction.update(bookingRef, { claimState: "pending", claimExpiresAt: expiresAt, claimConflict: null });
        const claimUrl = `${bookingClaimBaseUrl.value()}?booking=${encodeURIComponent(bookingId)}&token=${encodeURIComponent(rawToken)}`;
        transaction.create(firestore.collection("mail").doc(), {
            to: contact.email,
            message: { subject: "Confirmez votre réservation", text: `Consultez et confirmez cette réservation : ${claimUrl}` },
            templateId: "booking-claim-request",
            sourceId: bookingId,
            category: "booking-claim",
            createdAt: new Date()
        });
        transaction.create(firestore.collection("logs").doc(), bookingClaimAuditEvent({
            type: "booking-claim-requested",
            actorUid,
            actorRole: "professional",
            bookingId,
            contactId,
            requestId
        }));
    });

    return { bookingId, contactId, status: "email_queued", expiresAt: expiresAt.toISOString() };
});

exports.previewBookingClaim = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    const user = await requireVerifiedClaimUser(actorUid);
    const bookingId = String(request.data?.bookingId || "").trim();
    const rawToken = normalizeRawClaimToken(request.data?.token);
    const firestore = admin.firestore();
    const tokenRef = firestore.collection("bookingClaimTokens").doc(hashClaimValue(rawToken));
    const bookingRef = firestore.collection("bookings").doc(bookingId);

    const result = await firestore.runTransaction(async (transaction) => {
        const [tokenSnapshot, bookingSnapshot] = await Promise.all([transaction.get(tokenRef), transaction.get(bookingRef)]);
        const errorCode = validateClaimAccess(transaction, tokenRef, tokenSnapshot.data(), { bookingId, email: user.email });
        if (errorCode) return { errorCode };
        if (!bookingSnapshot.exists) return { errorCode: "invalid_claim_token" };
        const booking = bookingSnapshot.data();
        const profileSnapshot = await transaction.get(firestore.collection("proProfiles").doc(booking.proId));
        const profile = profileSnapshot.data() || {};
        const contact = booking.contacts?.find((item) => item.contactId === tokenSnapshot.data().contactId);
        if (!contact) return { errorCode: "invalid_claim_token" };
        return {
            booking: {
                bookingId,
            professionalName: profile.displayName || profile.name || profile.personalInfo?.displayName || "Professionnel",
                start: booking.start,
                end: booking.end,
                status: booking.status,
                contactName: contact.name,
                contactRole: contact.role
            }
        };
    });
    if (result.errorCode) throwClaimError(result.errorCode);
    return result.booking;
});

exports.resolveBookingClaim = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    const user = await requireVerifiedClaimUser(actorUid);
    const bookingId = String(request.data?.bookingId || "").trim();
    const rawToken = normalizeRawClaimToken(request.data?.token);
    const action = request.data?.action === "reject" ? "reject" : request.data?.action === "accept" ? "accept" : null;
    const requestId = normalizeRequestId(request.data?.requestId);
    if (!action) throw new HttpsError("invalid-argument", "Claim action is required.");
    const firestore = admin.firestore();
    const tokenRef = firestore.collection("bookingClaimTokens").doc(hashClaimValue(rawToken));
    const bookingRef = firestore.collection("bookings").doc(bookingId);

    const result = await firestore.runTransaction(async (transaction) => {
        const [tokenSnapshot, bookingSnapshot] = await Promise.all([transaction.get(tokenRef), transaction.get(bookingRef)]);
        const tokenData = tokenSnapshot.data();
        const errorCode = validateClaimAccess(transaction, tokenRef, tokenData, { bookingId, email: user.email });
        if (errorCode) return { errorCode };
        if (!bookingSnapshot.exists) return { errorCode: "invalid_claim_token" };
        const booking = bookingSnapshot.data();
        const contactIndex = booking.contacts?.findIndex((item) => item.contactId === tokenData.contactId) ?? -1;
        if (contactIndex < 0) return { errorCode: "invalid_claim_token" };
        const contact = booking.contacts[contactIndex];
        const now = new Date();

        if (action === "reject") {
            transaction.update(tokenRef, { usedAt: now });
            transaction.update(bookingRef, { claimState: "rejected", claimExpiresAt: null, claimConflict: null });
            transaction.create(firestore.collection("logs").doc(), bookingClaimAuditEvent({ type: "booking-claim-rejected", actorUid, actorRole: "client", bookingId, contactId: contact.contactId, requestId }));
            return { status: "rejected" };
        }

        const conflictReason = evaluateClaimConflict({ booking, contact, uid: actorUid });
        if (conflictReason) {
            transaction.update(tokenRef, { usedAt: now, conflictState: "review-required", requesterUid: actorUid });
            transaction.update(bookingRef, { claimState: "review-required", claimExpiresAt: null, claimConflict: { reasonCode: conflictReason, createdAt: now, resolvedAt: null, resolution: null } });
            transaction.create(firestore.collection("logs").doc(), bookingClaimAuditEvent({ type: "booking-claim-conflict", actorUid, actorRole: "client", bookingId, contactId: contact.contactId, requestId, metadata: { reasonCode: conflictReason } }));
            return { status: "review-required" };
        }

        const contacts = booking.contacts.map((item, index) => index === contactIndex ? { ...item, linkedUid: actorUid, verifiedAt: now } : item);
        const update = { contacts, claimState: "claimed", claimExpiresAt: null, claimConflict: null };
        const targetField = getClaimTargetField(contact.role);
        if (targetField) update[targetField] = actorUid;
        transaction.update(tokenRef, { usedAt: now });
        transaction.update(bookingRef, update);
        transaction.create(firestore.collection("logs").doc(), bookingClaimAuditEvent({ type: "booking-claim-succeeded", actorUid, actorRole: "client", bookingId, contactId: contact.contactId, requestId }));
        return { status: "claimed", grantsBookingAccess: Boolean(targetField) };
    });
    if (result.errorCode) throwClaimError(result.errorCode);
    return { bookingId, ...result };
});

exports.unlinkBookingClaim = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    const bookingId = String(request.data?.bookingId || "").trim();
    const contactId = String(request.data?.contactId || "").trim();
    const requestId = normalizeRequestId(request.data?.requestId);
    const isAdminActor = request.auth?.token?.admin === true;
    const firestore = admin.firestore();
    const bookingRef = firestore.collection("bookings").doc(bookingId);

    await firestore.runTransaction(async (transaction) => {
        const bookingSnapshot = await transaction.get(bookingRef);
        const tokens = await transaction.get(firestore.collection("bookingClaimTokens").where("bookingId", "==", bookingId));
        if (!bookingSnapshot.exists) throw new HttpsError("not-found", "Booking not found.");
        const booking = bookingSnapshot.data();
        const contactIndex = booking.contacts?.findIndex((item) => item.contactId === contactId) ?? -1;
        if (contactIndex < 0) throw new HttpsError("not-found", "Booking contact not found.");
        const contact = booking.contacts[contactIndex];
        if (!isAdminActor && contact.linkedUid !== actorUid) throw new HttpsError("permission-denied", "Linked client or administrator required.");
        if (!contact.linkedUid) throw new HttpsError("failed-precondition", "Booking contact is not linked.");
        const linkedUid = contact.linkedUid;
        const contacts = booking.contacts.map((item, index) => index === contactIndex ? { ...item, linkedUid: null, verifiedAt: null } : item);
        const update = { contacts, claimState: "unlinked", claimExpiresAt: null, claimConflict: null };
        const targetField = getClaimTargetField(contact.role);
        if (targetField && booking[targetField] === linkedUid) update[targetField] = null;
        transaction.update(bookingRef, update);
        tokens.docs.filter((document) => document.data().contactId === contactId && !document.data().revokedAt).forEach((document) => transaction.update(document.ref, { revokedAt: new Date() }));
        transaction.create(firestore.collection("logs").doc(), bookingClaimAuditEvent({ type: "booking-claim-unlinked", actorUid, actorRole: isAdminActor ? "admin" : "client", bookingId, contactId, requestId }));
    });
    return { bookingId, contactId, status: "unlinked" };
});

exports.resolveBookingClaimConflict = onCall(async (request) => {
    const actorUid = requireAuthenticatedUid(request);
    if (request.auth?.token?.admin !== true) throw new HttpsError("permission-denied", "Administrator claim required.");
    const bookingId = String(request.data?.bookingId || "").trim();
    const contactId = String(request.data?.contactId || "").trim();
    const approve = request.data?.approve === true;
    const requestId = normalizeRequestId(request.data?.requestId);
    const firestore = admin.firestore();
    const bookingRef = firestore.collection("bookings").doc(bookingId);

    const result = await firestore.runTransaction(async (transaction) => {
        const bookingSnapshot = await transaction.get(bookingRef);
        const tokenSnapshot = await transaction.get(firestore.collection("bookingClaimTokens").where("bookingId", "==", bookingId));
        if (!bookingSnapshot.exists) throw new HttpsError("not-found", "Booking not found.");
        const reviewToken = tokenSnapshot.docs.find((document) => document.data().contactId === contactId && document.data().conflictState === "review-required");
        if (!reviewToken?.data().requesterUid) throw new HttpsError("failed-precondition", "No claim conflict requires review.");
        const booking = bookingSnapshot.data();
        const contactIndex = booking.contacts?.findIndex((item) => item.contactId === contactId) ?? -1;
        if (contactIndex < 0) throw new HttpsError("not-found", "Booking contact not found.");
        const now = new Date();
        const resolution = approve ? "approved" : "denied";
        const update = { claimState: approve ? "claimed" : "rejected", claimConflict: { ...booking.claimConflict, resolvedAt: now, resolution } };
        if (approve) {
            const requesterUid = reviewToken.data().requesterUid;
            const contact = booking.contacts[contactIndex];
            update.contacts = booking.contacts.map((item, index) => index === contactIndex ? { ...item, linkedUid: requesterUid, verifiedAt: now } : item);
            const targetField = getClaimTargetField(contact.role);
            if (targetField) update[targetField] = requesterUid;
        }
        transaction.update(bookingRef, update);
        transaction.update(reviewToken.ref, { conflictState: resolution, resolvedAt: now, resolvedBy: actorUid });
        transaction.create(firestore.collection("logs").doc(), bookingClaimAuditEvent({ type: "booking-claim-conflict-resolved", actorUid, actorRole: "admin", bookingId, contactId, requestId, metadata: { resolution } }));
        return { status: approve ? "claimed" : "rejected" };
    });
    return { bookingId, contactId, ...result };
});

exports.listBookingClaimConflicts = onCall(async (request) => {
    requireAuthenticatedUid(request);
    if (request.auth?.token?.admin !== true) throw new HttpsError("permission-denied", "Administrator claim required.");
    const firestore = admin.firestore();
    const snapshot = await firestore.collection("bookings").where("claimState", "==", "review-required").limit(50).get();
    const conflicts = await Promise.all(snapshot.docs.map(async (document) => {
        const booking = document.data();
        const [profileSnapshot, tokenSnapshot] = await Promise.all([
            firestore.collection("proProfiles").doc(booking.proId).get(),
            firestore.collection("bookingClaimTokens").where("bookingId", "==", document.id).get()
        ]);
        const reviewToken = tokenSnapshot.docs.find((token) => token.data().conflictState === "review-required");
        if (!reviewToken) return null;
        const profile = profileSnapshot.data() || {};
        return {
            bookingId: document.id,
            contactId: reviewToken.data().contactId,
            professionalName: profile.displayName || profile.name || profile.personalInfo?.displayName || "Professionnel",
            reasonCode: booking.claimConflict?.reasonCode || "identity-conflict",
            createdAt: booking.claimConflict?.createdAt || null
        };
    }));
    return { conflicts: conflicts.filter(Boolean) };
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

exports.watchGoogleCalendar = onCall({ secrets: [googleClientSecret] }, async (request) => {
    if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Authentication required.");
    const tokenRef = admin.firestore().collection("gcalTokens").doc(request.auth.uid);
    const tokenSnapshot = await tokenRef.get();
    if (!tokenSnapshot.exists || !tokenSnapshot.data()?.refreshToken) throw new HttpsError("failed-precondition", "Google Calendar is not connected.");
    const accessToken = await refreshGoogleAccessToken(tokenSnapshot.data().refreshToken);
    const channelId = crypto.randomUUID();
    const channelToken = crypto.randomBytes(24).toString("hex");
    const watchResponse = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events/watch", { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ id: channelId, type: "web_hook", address: "https://us-central1-jr-booking-premium.cloudfunctions.net/calendarWebhook", token: channelToken }) });
    const watch = await watchResponse.json();
    if (!watchResponse.ok || !watch.resourceId) throw new HttpsError("failed-precondition", "Google Calendar watch could not be started.");
    await tokenRef.set({ calendarChannelId: channelId, calendarChannelToken: channelToken, calendarResourceId: watch.resourceId, calendarChannelExpiration: watch.expiration ? new Date(Number(watch.expiration)) : null }, { merge: true });
    return { status: "watching", expiration: watch.expiration || null };
});

exports.syncBookingToGoogleCalendar = onCall({ secrets: [googleClientSecret] }, async (request) => {
    if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Authentication required.");
    const bookingId = String(request.data?.bookingId || "").trim();
    if (!bookingId) throw new HttpsError("invalid-argument", "Booking ID is required.");
    const firestore = admin.firestore();
    const bookingRef = firestore.collection("bookings").doc(bookingId);
    const bookingSnapshot = await bookingRef.get();
    if (!bookingSnapshot.exists || bookingSnapshot.data().proId !== request.auth.uid) throw new HttpsError("permission-denied", "Booking ownership required.");
    const booking = bookingSnapshot.data();
    const tokenSnapshot = await firestore.collection("gcalTokens").doc(request.auth.uid).get();
    if (!tokenSnapshot.exists || !tokenSnapshot.data()?.refreshToken) throw new HttpsError("failed-precondition", "Google Calendar is not connected.");
    const accessToken = await refreshGoogleAccessToken(tokenSnapshot.data().refreshToken);
    const event = {
        summary: booking.guestName || booking.clientDisplayName || "Réservation JR Booking Premium",
        description: `Réservation ${bookingId}`,
        start: { dateTime: new Date(booking.start).toISOString() },
        end: { dateTime: new Date(booking.end).toISOString() }
    };
    const existingId = booking.googleCalendarEventId;
    const url = existingId
        ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(existingId)}`
        : "https://www.googleapis.com/calendar/v3/calendars/primary/events";
    const response = await fetch(url, { method: existingId ? "PATCH" : "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(event) });
    const result = await response.json();
    if (!response.ok || !result.id) throw new HttpsError("failed-precondition", "Google Calendar event could not be synchronized.");
    await bookingRef.update({ googleCalendarEventId: result.id, googleCalendarSyncedAt: new Date() });
    return { bookingId, eventId: result.id, status: existingId ? "updated" : "created" };
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

function requireAuthenticatedUid(request) {
    if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Authentication required.");
    return request.auth.uid;
}

function requireProfessionalRole(request) {
    const token = request.auth?.token || {};
    if (token.banned === true || (token.professional !== true && token.role !== "professional" && token.admin !== true)) {
        throw new HttpsError("permission-denied", "Professional role required.");
    }
}

function normalizeRequestId(value) {
    const requestId = String(value || "").trim();
    if (!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) throw new HttpsError("invalid-argument", "A valid request ID is required.");
    return requestId;
}

function validateBookingRange(startValue, endValue) {
    const start = String(startValue || "").trim();
    const end = String(endValue || "").trim();
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!start || !end || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
        throw new HttpsError("invalid-argument", "Booking end must be after its start.");
    }
    return { start, end };
}

function getValidatedContacts(value) {
    try {
        return normalizeBookingContacts(value);
    } catch (error) {
        if (error instanceof BookingContactValidationError) throw new HttpsError("invalid-argument", error.code);
        throw error;
    }
}

async function requireProfessionalOwnership(transaction, proId, actorUid) {
    const profileSnapshot = await transaction.get(admin.firestore().collection("proProfiles").doc(proId));
    const owners = profileSnapshot.data()?.owners;
    if (!profileSnapshot.exists || (proId !== actorUid && (!Array.isArray(owners) || !owners.includes(actorUid)))) {
        throw new HttpsError("permission-denied", "Professional profile ownership required.");
    }
}

function bookingContactAuditEvent({ type, actorUid, bookingId, contact, requestId }) {
    return {
        type,
        at: new Date(),
        actorUid,
        actorRole: "professional",
        outcome: "success",
        bookingId,
        contactId: contact.contactId,
        requestId,
        metadata: { role: contact.role }
    };
}

async function queueConfiguredNotificationEmail({ recipientUid, preferenceField, notificationId, booking, fallbackEmail, mailId, templateId, subject, text, category }) {
    const preferenceSnapshot = await admin.firestore().collection("notificationPreferences").doc(recipientUid).get();
    if ((preferenceSnapshot.data()?.[preferenceField] || "immediate") !== "immediate") return;
    const email = await resolveRecipientEmail(recipientUid, fallbackEmail);
    if (!email) return;
    await queueMail({
        mailId: mailId || `notification-${recipientUid}-${notificationId}`,
        to: email,
        templateId,
        subject,
        text,
        sourceId: booking?.id || notificationId,
        category
    });
}

async function queueMail({ mailId, to, templateId, subject, text, sourceId, category }) {
    const mailRef = mailId ? admin.firestore().collection("mail").doc(mailId) : admin.firestore().collection("mail").doc();
    await mailRef.set({
        to,
        message: { subject, text },
        templateId,
        sourceId,
        category,
        createdAt: new Date()
    });
    return mailRef.id;
}

async function resolveBookingMessageRecipient(booking, fromProfessional) {
    const recipientUid = fromProfessional ? booking.clientId : booking.proId;
    if (recipientUid) {
        try {
            const user = await admin.auth().getUser(recipientUid);
            if (user.email) return user.email;
        } catch {
            // Guest bookings may not have an Auth account yet.
        }
    }
    if (fromProfessional) {
        const contact = booking.contacts?.find((item) => item.role === "primary") || booking.guestContact;
        return contact?.email || booking.clientEmail || "";
    }
    return "";
}

async function isProfessionalProfileOwner(proId, actorUid) {
    const profile = await admin.firestore().collection("proProfiles").doc(proId).get();
    const owners = profile.data()?.owners;
    return profile.exists && Array.isArray(owners) && owners.includes(actorUid);
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

async function requireVerifiedClaimUser(uid) {
    const user = await admin.auth().getUser(uid);
    if (!user.email || user.emailVerified !== true) throw new HttpsError("failed-precondition", "A verified email is required.");
    return user;
}

function normalizeRawClaimToken(value) {
    const token = String(value || "").trim();
    if (!/^[a-f0-9]{64}$/.test(token)) throw new HttpsError("invalid-argument", "A valid claim token is required.");
    return token;
}

function validateClaimAccess(transaction, tokenRef, tokenData, context) {
    try {
        validateClaimToken(tokenData, context);
        return null;
    } catch (error) {
        const code = error instanceof BookingClaimError ? error.code : "invalid_claim_token";
        if (code === "claim_email_mismatch" && tokenData) {
            const attemptCount = Number(tokenData.attemptCount || 0) + 1;
            transaction.update(tokenRef, { attemptCount, revokedAt: attemptCount >= MAX_CLAIM_ATTEMPTS ? new Date() : null });
        }
        return code;
    }
}

function throwClaimError(code) {
    const errorCode = code === "claim_email_mismatch" ? "permission-denied" : code === "invalid_claim_token" ? "not-found" : "failed-precondition";
    throw new HttpsError(errorCode, code);
}

function bookingClaimAuditEvent({ type, actorUid, actorRole, bookingId, contactId, requestId, metadata = {} }) {
    return {
        type,
        at: new Date(),
        actorUid,
        actorRole,
        outcome: "success",
        bookingId,
        contactId,
        requestId,
        metadata
    };
}

async function hasServerDelegatePermission(proId, actorUid, permission) {
    const profile = await admin.firestore().collection("proProfiles").doc(proId).get();
    const delegate = profile.data()?.delegates?.[actorUid];
    return profile.exists && delegate?.status === "active" && delegate.permissions?.includes(permission);
}

function sanitizeDelegatedBooking(id, booking) {
    const allowedFields = [
        "proId", "start", "end", "status", "statusHistory", "service", "createdAt", "meetingLinks"
    ];
    return allowedFields.reduce((sanitized, field) => {
        if (booking[field] === undefined) return sanitized;
        sanitized[field] = field === "service"
            ? { name: String(booking.service?.name || ""), durationMinutes: Number(booking.service?.durationMinutes) || 0 }
            : booking[field];
        return sanitized;
    }, { id });
}

async function resolveProfessionalRecipientUids(proId, delegatePermission) {
    if (!proId) return [];
    const profile = await admin.firestore().collection("proProfiles").doc(proId).get();
    if (!profile.exists) return [proId];
    const data = profile.data();
    const owners = Array.isArray(data.owners) ? data.owners : [];
    const delegates = Object.entries(data.delegates || {})
        .filter(([, delegate]) => delegate?.status === "active" && delegate.permissions?.includes(delegatePermission))
        .map(([uid]) => uid);
    return [...new Set([...owners, ...delegates])];
}

async function resolveRecipientEmail(uid, fallbackEmail = "") {
    if (uid) {
        try {
            const user = await admin.auth().getUser(uid);
            if (user.email) return user.email;
        } catch {
            // Guest bookings may not have an Auth account yet.
        }
    }
    return fallbackEmail;
}

function getPrimaryBookingContactEmail(booking) {
    const contact = booking.contacts?.find((item) => item.role === "primary") || booking.guestContact;
    return contact?.email || booking.clientEmail || "";
}