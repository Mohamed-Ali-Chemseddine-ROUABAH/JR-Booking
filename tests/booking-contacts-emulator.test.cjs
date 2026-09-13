const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
const functionsHost = process.env.FUNCTIONS_EMULATOR_HOST;
const projectId = process.env.FIREBASE_PROJECT_ID || "jr-booking-premium";

if (!authHost || !firestoreHost || !functionsHost) {
    throw new Error("Set local Auth, Firestore, and Functions emulator hosts before running this test.");
}
for (const host of [authHost, firestoreHost, functionsHost]) {
    if (!/^(localhost|127\.0\.0\.1):\d+$/.test(host)) throw new Error(`Refusing non-local emulator host: ${host}`);
}

process.env.GCLOUD_PROJECT = projectId;
const admin = require("../functions/node_modules/firebase-admin");
const app = admin.initializeApp({ projectId }, `booking-contacts-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("trusted professional booking contact flow", { timeout: 30000 }, async () => {
    const unique = crypto.randomUUID();
    const email = `pro-${unique}@example.test`;
    const password = "ChangeMe123!";
    let uid;
    let bookingId;
    const directBookingIds = [];

    try {
        let auth = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, {
            email,
            password,
            returnSecureToken: true
        });
        uid = auth.localId;
        assert.ok(uid && auth.idToken, JSON.stringify(auth));
        await assert.rejects(() => callFunction("createProfessionalBooking", auth.idToken, {
            requestId: crypto.randomUUID(),
            proId: uid,
            start: "2026-09-15T08:00",
            end: "2026-09-15T09:00",
            contacts: [{ name: "Client Test", email: "client@example.com", role: "primary", notify: true }]
        }), /PERMISSION_DENIED|permission-denied/);
        await app.auth().setCustomUserClaims(uid, { professional: true, role: "professional" });
        auth = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, {
            email,
            password,
            returnSecureToken: true
        });
        await firestore.collection("proProfiles").doc(uid).set({ owners: [uid], accountStatus: "active" });

        const createRequestId = crypto.randomUUID();
        const createPayload = {
            requestId: createRequestId,
            proId: uid,
            start: "2026-09-15T09:00",
            end: "2026-09-15T10:00",
            contacts: [
                { name: "Client Test", email: " CLIENT@Example.COM ", role: "primary", notify: true },
                { name: "Parent Test", email: "parent@example.com", role: "guardian", notify: false }
            ]
        };
        const created = await callFunction("createProfessionalBooking", auth.idToken, createPayload);
        bookingId = created.bookingId;
        const retried = await callFunction("createProfessionalBooking", auth.idToken, createPayload);
        assert.equal(retried.bookingId, bookingId);
        const createdBooking = (await firestore.collection("bookings").doc(bookingId).get()).data();
        assert.equal(createdBooking.clientId, null);
        assert.equal(createdBooking.claimState, "unclaimed");
        assert.equal(createdBooking.contacts.length, 2);
        assert.equal(createdBooking.contacts[0].email, "client@example.com");
        assert.equal(createdBooking.contacts[0].role, "primary");
        assert.equal(createdBooking.contacts[1].notify, false);

        await callFunction("updateProfessionalBooking", auth.idToken, {
            requestId: crypto.randomUUID(),
            bookingId,
            start: "2026-09-15T10:00",
            end: "2026-09-15T11:30",
            contacts: [
                { name: "Client Modifié", email: "client@example.com", role: "primary", notify: true },
                { name: "Payeur Test", email: "payer@example.com", role: "payer", notify: true }
            ]
        });
        const updatedBooking = (await firestore.collection("bookings").doc(bookingId).get()).data();
        assert.equal(updatedBooking.start, "2026-09-15T10:00");
        assert.equal(updatedBooking.contacts[0].name, "Client Modifié");
        assert.equal(updatedBooking.contacts[0].contactId, createdBooking.contacts[0].contactId);
        assert.equal(updatedBooking.contacts[1].role, "payer");

        const auditSnapshot = await firestore.collection("logs").where("bookingId", "==", bookingId).get();
        const eventTypes = auditSnapshot.docs.map((document) => document.data().type).filter(Boolean);
        assert.ok(eventTypes.includes("booking-contact-added"));
        assert.ok(eventTypes.includes("booking-contact-updated"));
        assert.ok(eventTypes.includes("booking-contact-removed"));

        const allowedDirectId = `allowed-${unique}`;
        directBookingIds.push(allowedDirectId);
        const allowedDirectResponse = await writeBookingDirect(allowedDirectId, auth.idToken, {
            proId: uid,
            clientId: uid,
            clientAddress: "",
            start: "2026-09-16T09:00",
            end: "2026-09-16T10:00",
            status: "pending",
            createdBy: uid,
            createdAt: new Date().toISOString()
        });
        assert.equal(allowedDirectResponse.status, 200);

        const deniedDirectId = `denied-${unique}`;
        directBookingIds.push(deniedDirectId);
        const deniedDirectResponse = await writeBookingDirect(deniedDirectId, auth.idToken, {
            proId: uid,
            clientId: uid,
            clientAddress: "",
            contacts: [{ name: "Injected", email: "injected@example.com", role: "primary", notify: true }],
            start: "2026-09-16T10:00",
            end: "2026-09-16T11:00",
            status: "pending",
            createdBy: uid,
            createdAt: new Date().toISOString()
        });
        assert.equal(deniedDirectResponse.status, 403);
    } finally {
        if (bookingId) await firestore.collection("bookings").doc(bookingId).delete();
        await Promise.all(directBookingIds.map((documentId) => firestore.collection("bookings").doc(documentId).delete()));
        if (bookingId) {
            const auditSnapshot = await firestore.collection("logs").where("bookingId", "==", bookingId).get();
            await Promise.all(auditSnapshot.docs.map((document) => document.ref.delete()));
        }
        if (uid) {
            await firestore.collection("proProfiles").doc(uid).delete();
            await app.auth().deleteUser(uid).catch(() => {});
        }
        await app.delete();
    }
});

async function callFunction(name, idToken, data) {
    const response = await fetch(`http://${functionsHost}/${projectId}/us-central1/${name}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ data })
    });
    const payload = await response.json();
    if (!response.ok || payload.error) throw new Error(JSON.stringify(payload));
    return payload.result;
}

async function postJson(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response.json();
}

async function writeBookingDirect(documentId, idToken, booking) {
    const fields = Object.fromEntries(Object.entries(booking).map(([key, value]) => [key, toFirestoreValue(value)]));
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/bookings?documentId=${documentId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields })
    });
}

function toFirestoreValue(value) {
    if (value === null) return { nullValue: null };
    if (typeof value === "string") return { stringValue: value };
    if (typeof value === "boolean") return { booleanValue: value };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
    if (value instanceof Date) return { timestampValue: value.toISOString() };
    if (typeof value === "object") {
        return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toFirestoreValue(item)])) } };
    }
    throw new TypeError(`Unsupported Firestore test value: ${typeof value}`);
}