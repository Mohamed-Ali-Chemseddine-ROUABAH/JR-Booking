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
const app = admin.initializeApp({ projectId }, `booking-series-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("trusted recurring booking scope flow", { timeout: 45000 }, async () => {
    const suffix = crypto.randomUUID();
    const email = `series-pro-${suffix}@example.test`;
    const clientEmail = `series-client-${suffix}@example.test`;
    const otherClientEmail = `series-other-client-${suffix}@example.test`;
    const password = "ChangeMe123!";
    const uid = (await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, {
        email,
        password,
        returnSecureToken: true
    })).localId;
    await app.auth().setCustomUserClaims(uid, { professional: true, role: "professional" });
    const auth = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, {
        email,
        password,
        returnSecureToken: true
    });
    const client = await createUser(clientEmail, password);
    const otherClient = await createUser(otherClientEmail, password);
    const adminUser = await createUser(`series-admin-${suffix}@example.test`, password);
    await app.auth().setCustomUserClaims(adminUser.uid, { admin: true, role: "admin" });
    const adminAuth = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email: `series-admin-${suffix}@example.test`, password, returnSecureToken: true });
    const seriesId = `series-${suffix}`;
    const bookingIds = [0, 1, 2].map((index) => `occurrence-${suffix}-${index}`);
    const clientBookingId = `client-booking-${suffix}`;

    try {
        await firestore.collection("proProfiles").doc(uid).set({ owners: [uid], accountStatus: "active" });
        await Promise.all(bookingIds.map((bookingId, occurrenceIndex) => firestore.collection("bookings").doc(bookingId).set({
            proId: uid,
            seriesId,
            occurrenceIndex,
            contacts: [{ contactId: `contact-${occurrenceIndex}`, name: "Client", email: "client@example.test", role: "primary", notify: true, verifiedAt: null, linkedUid: null }],
            guestContact: { name: "Client", email: "client@example.test" },
            start: `2026-09-${20 + occurrenceIndex}T09:00`,
            end: `2026-09-${20 + occurrenceIndex}T10:00`,
            status: "pending",
            createdBy: uid,
            createdAt: new Date()
        })));

        const followingPayload = {
            requestId: crypto.randomUUID(),
            bookingId: bookingIds[1],
            seriesScope: "this-and-following",
            start: "2026-09-30T13:00",
            end: "2026-09-30T14:30",
            contacts: [{ name: "Client Following", email: "client@example.test", role: "primary", notify: true }]
        };
        const following = await callFunction("updateProfessionalBooking", auth.idToken, followingPayload);
        assert.deepEqual(following.affectedBookingIds, [bookingIds[1], bookingIds[2]]);
        assert.deepEqual(following.unaffectedBookingIds, [bookingIds[0]]);
        assert.equal((await firestore.collection("bookings").doc(bookingIds[0]).get()).data().start, "2026-09-20T09:00");
        const followingTarget = (await firestore.collection("bookings").doc(bookingIds[1]).get()).data();
        assert.equal(followingTarget.start, "2026-09-30T13:00");
        assert.equal(followingTarget.end, "2026-09-30T14:30");
        assert.equal(followingTarget.contacts[0].name, "Client Following");
        const followingOccurrence = (await firestore.collection("bookings").doc(bookingIds[2]).get()).data();
        assert.equal(followingOccurrence.start, "2026-10-01T13:00");
        assert.equal(followingOccurrence.end, "2026-10-01T14:30");
        assert.equal(followingOccurrence.contacts[0].name, "Client Following");
        const retry = await callFunction("updateProfessionalBooking", auth.idToken, followingPayload);
        assert.deepEqual(retry, following);
        const followingAudit = await firestore.collection("logs").where("type", "==", "booking-series-modified").where("requestId", "==", followingPayload.requestId).get();
        assert.equal(followingAudit.size, 1);

        const allPayload = {
            requestId: crypto.randomUUID(),
            bookingId: bookingIds[1],
            seriesScope: "all-in-series",
            start: "2026-10-01T15:00",
            end: "2026-10-01T16:00",
            contacts: [{ name: "Client All", email: "client@example.test", role: "primary", notify: true }]
        };
        const all = await callFunction("updateProfessionalBooking", auth.idToken, allPayload);
        assert.deepEqual(all.affectedBookingIds, bookingIds);
        assert.equal((await firestore.collection("bookings").doc(bookingIds[0]).get()).data().start, "2026-09-21T11:00");
        assert.equal((await firestore.collection("bookings").doc(bookingIds[1]).get()).data().start, "2026-10-01T15:00");
        assert.equal((await firestore.collection("bookings").doc(bookingIds[0]).get()).data().end, "2026-09-21T12:00");
        assert.equal((await firestore.collection("bookings").doc(bookingIds[2]).get()).data().start, "2026-10-02T15:00");

        const directResponse = await writeBookingDirect(`direct-series-${suffix}`, auth.idToken, {
            proId: uid,
            seriesId,
            occurrenceIndex: 3,
            start: "2026-10-04T09:00",
            end: "2026-10-04T10:00",
            status: "pending",
            createdBy: uid,
            createdAt: new Date().toISOString()
        });
        assert.equal(directResponse.status, 403);

        const mailResponse = await writeMailDirect(`direct-mail-${suffix}`, auth.idToken);
        assert.equal(mailResponse.status, 403);
        const applicationResponse = await writeApplicationDirect(`direct-application-${suffix}`, auth.idToken, uid);
        assert.equal(applicationResponse.status, 403);

        const anonymousRead = await readBookingDirect(bookingIds[0]);
        assert.equal(anonymousRead.status, 403);
        const unrelatedRead = await readBookingDirect(bookingIds[0], otherClient.idToken);
        assert.equal(unrelatedRead.status, 403);
        await firestore.collection("bookings").doc(bookingIds[0]).update({ clientId: client.uid });
        const authorizedRead = await readBookingDirect(bookingIds[0], client.idToken);
        assert.equal(authorizedRead.status, 200);
        const professionalUpdate = await patchBookingDirect(bookingIds[0], auth.idToken, { status: "accepted" }, ["status"]);
        assert.equal(professionalUpdate.status, 200);
        const identityUpdate = await patchBookingDirect(bookingIds[0], auth.idToken, { clientId: otherClient.uid }, ["clientId"]);
        assert.equal(identityUpdate.status, 403);

        await firestore.collection("bookings").doc(bookingIds[0]).collection("messages").doc("message-1").set({ authorUid: uid, authorRole: "professional", body: "Private note", createdAt: new Date() });
        assert.equal((await readMessageDirect(bookingIds[0], "message-1", auth.idToken)).status, 200);
        assert.equal((await readMessageDirect(bookingIds[0], "message-1", client.idToken)).status, 200);
        assert.equal((await readMessageDirect(bookingIds[0], "message-1", otherClient.idToken)).status, 403);
        assert.equal((await readMessageDirect(bookingIds[0], "message-1", adminAuth.idToken)).status, 200);
        assert.equal((await writeMessageDirect(bookingIds[0], "direct-message", auth.idToken)).status, 403);
        const professionalMessage = await callFunction("sendBookingMessage", auth.idToken, { bookingId: bookingIds[0], body: "Votre réservation est confirmée." });
        assert.equal(professionalMessage.notificationStatus, "queued");
        const professionalMessageData = (await firestore.collection("bookings").doc(bookingIds[0]).collection("messages").doc(professionalMessage.messageId).get()).data();
        assert.equal(professionalMessageData.senderRole, "professional");
        assert.equal(professionalMessageData.notificationStatus, "queued");
        assert.equal((await firestore.collection("mail").where("sourceId", "==", `${bookingIds[0]}/${professionalMessage.messageId}`).get()).size, 1);
        const clientMessage = await callFunction("sendBookingMessage", client.idToken, { bookingId: bookingIds[0], body: "Merci, à bientôt.", notifyEmail: false });
        assert.equal(clientMessage.notificationStatus, "not-requested");
        assert.equal((await firestore.collection("bookings").doc(bookingIds[0]).collection("messages").doc(clientMessage.messageId).get()).data().senderRole, "client");
        await assert.rejects(() => callFunction("sendBookingMessage", otherClient.idToken, { bookingId: bookingIds[0], body: "Accès interdit." }), /PERMISSION_DENIED/);

        const singlePayload = {
            requestId: crypto.randomUUID(),
            bookingId: bookingIds[1],
            seriesScope: "this",
            start: "2026-12-20T14:00",
            end: "2026-12-20T15:30",
            contacts: [{ name: "Client Single", email: "client@example.test", role: "primary", notify: true }]
        };
        const single = await callFunction("updateProfessionalBooking", auth.idToken, singlePayload);
        assert.deepEqual(single.affectedBookingIds, [bookingIds[1]]);
        assert.deepEqual(single.unaffectedBookingIds.sort(), [bookingIds[0], bookingIds[2]].sort());
        assert.equal((await firestore.collection("bookings").doc(bookingIds[0]).get()).data().start, "2026-09-21T11:00");
        assert.equal((await firestore.collection("bookings").doc(bookingIds[1]).get()).data().start, "2026-12-20T14:00");
        assert.equal((await firestore.collection("bookings").doc(bookingIds[2]).get()).data().start, "2026-10-02T15:00");

        const clientBookingResponse = await writeBookingDirect(clientBookingId, client.idToken, {
            proId: uid,
            clientId: client.uid,
            clientAddress: "",
            start: "2026-10-05T09:00",
            end: "2026-10-05T10:00",
            status: "pending",
            createdBy: client.uid,
            createdAt: new Date().toISOString()
        });
        assert.equal(clientBookingResponse.status, 200);
        assert.equal((await patchBookingDirect(clientBookingId, client.idToken, { status: "rejected" }, ["status"])).status, 200);
        assert.equal((await patchBookingDirect(clientBookingId, client.idToken, { start: "2026-10-05T11:00" }, ["start"])).status, 403);
    } finally {
        await Promise.all(bookingIds.map(async (bookingId) => {
            const messages = await firestore.collection("bookings").doc(bookingId).collection("messages").get();
            await Promise.all(messages.docs.map((document) => document.ref.delete()));
            await firestore.collection("bookings").doc(bookingId).delete();
        }));
        await firestore.collection("bookings").doc(clientBookingId).delete().catch(() => {});
        await firestore.collection("bookings").doc(bookingIds[0]).collection("messages").doc("message-1").delete().catch(() => {});
        const logs = await firestore.collection("logs").where("bookingId", "in", bookingIds).get();
        await Promise.all(logs.docs.map((document) => document.ref.delete()));
        await firestore.collection("proProfiles").doc(uid).delete();
        await app.auth().deleteUser(uid).catch(() => {});
        await app.auth().deleteUser(client.uid).catch(() => {});
        await app.auth().deleteUser(otherClient.uid).catch(() => {});
        await app.auth().deleteUser(adminUser.uid).catch(() => {});
        await app.delete();
    }
});

async function callFunction(name, idToken, data) {
    const response = await fetch(`http://${functionsHost}/${projectId}/us-central1/${name}`, { method: "POST", headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ data }) });
    const payload = await response.json();
    if (!response.ok || payload.error) throw new Error(JSON.stringify(payload));
    return payload.result;
}

async function postJson(url, data) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    return response.json();
}

async function writeBookingDirect(documentId, idToken, booking) {
    const fields = Object.fromEntries(Object.entries(booking).map(([key, value]) => [key, toFirestoreValue(value)]));
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/bookings?documentId=${documentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields })
    });
}

async function writeMailDirect(documentId, idToken) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/mail?documentId=${documentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { to: { stringValue: "attacker@example.test" }, message: { mapValue: { fields: { subject: { stringValue: "Injected" } } } } } })
    });
}

async function writeApplicationDirect(documentId, idToken, uid) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/professionalRequests?documentId=${documentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { createdBy: { stringValue: uid }, status: { stringValue: "pending" } } })
    });
}

async function readBookingDirect(documentId, idToken) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/bookings/${documentId}`, {
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : {}
    });
}

async function patchBookingDirect(documentId, idToken, values, updateMask) {
    const query = updateMask.map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`).join("&");
    const fields = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, toFirestoreValue(value)]));
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/bookings/${documentId}?${query}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields })
    });
}

async function readMessageDirect(bookingId, messageId, idToken) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/bookings/${bookingId}/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${idToken}` }
    });
}

async function writeMessageDirect(bookingId, messageId, idToken) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/bookings/${bookingId}/messages?documentId=${messageId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { senderUid: { stringValue: "attacker" }, body: { stringValue: "Injected" } } })
    });
}

async function createUser(email, password) {
    const signup = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email, password, returnSecureToken: true });
    const signin = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email, password, returnSecureToken: true });
    return { uid: signup.localId, idToken: signin.idToken };
}

function toFirestoreValue(value) {
    if (value === null) return { nullValue: null };
    if (typeof value === "string") return { stringValue: value };
    if (typeof value === "boolean") return { booleanValue: value };
    if (typeof value === "number") return { integerValue: String(value) };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
    if (value instanceof Date) return { timestampValue: value.toISOString() };
    if (typeof value === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toFirestoreValue(item)])) } };
    throw new TypeError(`Unsupported Firestore test value: ${typeof value}`);
}
