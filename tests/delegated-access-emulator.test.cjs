const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
const functionsHost = process.env.FUNCTIONS_EMULATOR_HOST;
const projectId = process.env.FIREBASE_PROJECT_ID || "jr-booking-premium";
for (const host of [authHost, firestoreHost, functionsHost]) {
    if (!host || !/^(localhost|127\.0\.0\.1):\d+$/.test(host)) throw new Error(`Local emulator host required: ${host || "missing"}`);
}

process.env.GCLOUD_PROJECT = projectId;
const admin = require("../functions/node_modules/firebase-admin");
const app = admin.initializeApp({ projectId }, `delegated-access-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("delegated access is profile-scoped and permission-limited", { timeout: 45000 }, async () => {
    const suffix = crypto.randomUUID();
    const password = `Test-${suffix}-Aa1!`;
    const owner = await createUser(`delegate-owner-${suffix}@example.test`, password);
    const delegate = await createUser(`delegate-user-${suffix}@example.test`, password);
    const messagesOnlyDelegate = await createUser(`delegate-messages-${suffix}@example.test`, password);
    const client = await createUser(`delegate-client-${suffix}@example.test`, password);
    const profileId = owner.uid;
    const secondProfileId = `delegate-profile-${suffix}`;
    const bookingId = `delegate-booking-${suffix}`;
    const secondBookingId = `delegate-booking-second-${suffix}`;
    const outsiderBookingId = `delegate-booking-outsider-${suffix}`;

    try {
        await app.auth().setCustomUserClaims(owner.uid, { professional: true, role: "professional" });
        const ownerAuth = await signIn(owner.email, password);
        await firestore.collection("proProfiles").doc(profileId).set({ owners: [owner.uid], accountStatus: "active" });
        await firestore.collection("proProfiles").doc(secondProfileId).set({ owners: [owner.uid], accountStatus: "active" });
        await firestore.collection("bookings").doc(bookingId).set({ proId: profileId, clientId: client.uid, start: "2026-09-20T09:00", end: "2026-09-20T10:00", status: "pending", createdBy: client.uid, createdAt: new Date(), service: { name: "Consultation", durationMinutes: 60, price: 120 }, paymentContext: { rib: "private" }, customPrice: 120, movementQuote: { distance: 10 }, prepNotes: "legacy-private" });
        await firestore.collection("bookings").doc(secondBookingId).set({ proId: profileId, clientId: client.uid, start: "2026-09-20T10:00", end: "2026-09-20T11:00", status: "pending", createdBy: client.uid, createdAt: new Date() });
        await firestore.collection("bookings").doc(outsiderBookingId).set({ proId: `outsider-${suffix}`, clientId: client.uid, start: "2026-09-20T11:00", end: "2026-09-20T12:00", status: "pending", createdBy: client.uid, createdAt: new Date() });
        await firestore.collection("bookings").doc(bookingId).collection("private").doc("professional").set({ prepNotes: "Owner only" });
        await firestore.collection("bookings").doc(bookingId).collection("messages").doc("message-1").set({ senderUid: owner.uid, senderRole: "professional", body: "Bonjour", createdAt: new Date(), notificationStatus: "not-requested" });

        const added = await callFunction("addProfessionalDelegate", ownerAuth.idToken, { profileId, email: delegate.email, permissions: ["manageBookings", "manageMessages"] });
        assert.equal(added.status, "active");
        const delegateAuth = await signIn(delegate.email, password);
        assert.equal((await readProfile(profileId, delegateAuth.idToken)).status, 200);
        assert.equal((await readBooking(bookingId, delegateAuth.idToken)).status, 403);
        const delegated = await callFunction("listDelegatedBookings", delegateAuth.idToken, { profileId });
        assert.deepEqual(delegated.permissions.sort(), ["manageBookings", "manageMessages"]);
        assert.equal(delegated.bookings.length, 2);
        const delegatedSensitiveBooking = delegated.bookings.find((booking) => booking.id === bookingId);
        for (const privateField of ["clientId", "clientDisplayName", "guestName", "guestContact", "contacts", "clientAddress", "intakeAnswers", "paymentContext", "customPrice", "movementQuote", "prepNotes"]) {
            assert.equal(privateField in delegatedSensitiveBooking, false, `${privateField} must not be returned to delegates`);
        }
        assert.deepEqual(delegatedSensitiveBooking.service, { name: "Consultation", durationMinutes: 60 });
        assert.equal((await patchBooking(bookingId, delegateAuth.idToken, { status: "accepted" }, ["status"])).status, 200);
        assert.equal((await patchBooking(bookingId, delegateAuth.idToken, { prepNotes: "Private" }, ["prepNotes"])).status, 403);
        assert.equal((await readMessage(bookingId, "message-1", delegateAuth.idToken)).status, 200);
        assert.equal((await readClientRecord(profileId, client.uid, delegateAuth.idToken)).status, 403);
        assert.equal((await readPrivateNote(bookingId, delegateAuth.idToken)).status, 403);
        assert.equal((await readPrivateNote(bookingId, (await signIn(client.email, password)).idToken)).status, 403);
        assert.equal((await callFunction("getBookingPrepNotes", ownerAuth.idToken, { bookingId })).prepNotes, "Owner only");
        await callFunction("updateBookingPrepNotes", ownerAuth.idToken, { bookingId, prepNotes: "Updated owner note" });
        assert.equal((await callFunction("getBookingPrepNotes", ownerAuth.idToken, { bookingId })).prepNotes, "Updated owner note");
        assert.equal((await callFunction("sendBookingMessage", delegateAuth.idToken, { bookingId, body: "Réponse déléguée", notifyEmail: false })).notificationStatus, "not-requested");
        assert.equal((await callFunction("batchUpdateBookingStatus", delegateAuth.idToken, { bookingIds: [bookingId, secondBookingId], status: "accepted" })).updated, 2);
        assert.equal((await firestore.collection("bookings").doc(secondBookingId).get()).data().status, "accepted");
        await assert.rejects(() => callFunction("batchUpdateBookingStatus", delegateAuth.idToken, { bookingIds: [secondBookingId, outsiderBookingId], status: "done" }));
        assert.equal((await firestore.collection("bookings").doc(secondBookingId).get()).data().status, "accepted");
        await waitForNotification(owner.uid, `${bookingId}-booking-accepted`);
        await waitForNotification(delegate.uid, `${bookingId}-booking-accepted`);
        assert.equal((await firestore.collection("notifications").doc(delegate.uid).collection("items").doc(`${bookingId}-booking-accepted`).get()).data().clientId, undefined);

        await callFunction("addProfessionalDelegate", ownerAuth.idToken, { profileId, email: messagesOnlyDelegate.email, permissions: ["manageMessages"] });
        await callFunction("addProfessionalDelegate", ownerAuth.idToken, { profileId: secondProfileId, email: messagesOnlyDelegate.email, permissions: ["manageMessages"] });
        const messagesAuth = await signIn(messagesOnlyDelegate.email, password);
        assert.deepEqual((await app.auth().getUser(messagesOnlyDelegate.uid)).customClaims.delegateProfileIds.sort(), [profileId, secondProfileId].sort());
        assert.equal((await readBooking(bookingId, messagesAuth.idToken)).status, 403);
        assert.equal((await patchBooking(bookingId, messagesAuth.idToken, { status: "done" }, ["status"])).status, 403);
        assert.equal((await readMessage(bookingId, "message-1", messagesAuth.idToken)).status, 200);
        assert.equal((await callFunction("sendBookingMessage", messagesAuth.idToken, { bookingId, body: "Message uniquement", notifyEmail: false })).notificationStatus, "not-requested");
        await callFunction("removeProfessionalDelegate", ownerAuth.idToken, { profileId, delegateUid: messagesOnlyDelegate.uid });
        const refreshedMessagesAuth = await signIn(messagesOnlyDelegate.email, password);
        assert.deepEqual((await app.auth().getUser(messagesOnlyDelegate.uid)).customClaims.delegateProfileIds, [secondProfileId]);
        assert.equal((await callFunction("listDelegatedBookings", refreshedMessagesAuth.idToken, { profileId: secondProfileId })).profileId, secondProfileId);

        await callFunction("removeProfessionalDelegate", ownerAuth.idToken, { profileId, delegateUid: delegate.uid });
        assert.equal((await readBooking(bookingId, delegateAuth.idToken)).status, 403);
    } finally {
        const messageDocuments = await firestore.collection("bookings").doc(bookingId).collection("messages").get().catch(() => null);
        await Promise.all((messageDocuments?.docs || []).map((message) => message.ref.delete().catch(() => {})));
        await firestore.collection("bookings").doc(bookingId).collection("private").doc("professional").delete().catch(() => {});
        await firestore.collection("bookings").doc(bookingId).delete().catch(() => {});
        await firestore.collection("bookings").doc(secondBookingId).delete().catch(() => {});
        await firestore.collection("bookings").doc(outsiderBookingId).delete().catch(() => {});
        await firestore.collection("proProfiles").doc(profileId).delete().catch(() => {});
        await firestore.collection("proProfiles").doc(secondProfileId).delete().catch(() => {});
        await Promise.all([owner, delegate, messagesOnlyDelegate, client].map((user) => app.auth().deleteUser(user.uid).catch(() => {})));
        await app.delete();
    }
});

async function createUser(email, password) {
    const result = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email, password, returnSecureToken: true });
    return { uid: result.localId, email };
}

async function signIn(email, password) {
    return postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email, password, returnSecureToken: true });
}

async function callFunction(name, idToken, data) {
    const response = await fetch(`http://${functionsHost}/${projectId}/us-central1/${name}`, { method: "POST", headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ data }) });
    const payload = await response.json();
    if (!response.ok || payload.error) throw new Error(JSON.stringify(payload));
    return payload.result;
}

async function readProfile(profileId, idToken) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/proProfiles/${profileId}`, { headers: { Authorization: `Bearer ${idToken}` } });
}

async function readBooking(bookingId, idToken) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/bookings/${bookingId}`, { headers: { Authorization: `Bearer ${idToken}` } });
}

async function readMessage(bookingId, messageId, idToken) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/bookings/${bookingId}/messages/${messageId}`, { headers: { Authorization: `Bearer ${idToken}` } });
}

async function readPrivateNote(bookingId, idToken) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/bookings/${bookingId}/private/professional`, { headers: { Authorization: `Bearer ${idToken}` } });
}

async function readClientRecord(profileId, clientId, idToken) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/proClientRecords/${profileId}_${clientId}`, { headers: { Authorization: `Bearer ${idToken}` } });
}

async function patchBooking(bookingId, idToken, values, updateMask) {
    const fields = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { stringValue: value }]));
    const query = updateMask.map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`).join("&");
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/bookings/${bookingId}?${query}`, { method: "PATCH", headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ fields }) });
}

async function postJson(url, body) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return response.json();
}

async function waitForNotification(userId, notificationId) {
    const reference = firestore.collection("notifications").doc(userId).collection("items").doc(notificationId);
    for (let attempt = 0; attempt < 40; attempt += 1) {
        if ((await reference.get()).exists) return;
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.fail(`Notification ${notificationId} was not created for ${userId}`);
}
