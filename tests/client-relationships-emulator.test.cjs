const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
const projectId = process.env.FIREBASE_PROJECT_ID || "jr-booking-premium";

if (!authHost || !firestoreHost) {
    throw new Error("Set local Auth and Firestore emulator hosts before running this test.");
}
for (const host of [authHost, firestoreHost]) {
    if (!/^(localhost|127\.0\.0\.1):\d+$/.test(host)) throw new Error(`Refusing non-local emulator host: ${host}`);
}

process.env.GCLOUD_PROJECT = projectId;
const admin = require("../functions/node_modules/firebase-admin");
const app = admin.initializeApp({ projectId }, `client-relationships-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("mutual history relationship consent flow", { timeout: 45000 }, async () => {
    const unique = crypto.randomUUID();
    const clientA = await createUser(`history-a-${unique}@example.test`, "ChangeMe123!");
    const clientB = await createUser(`history-b-${unique}@example.test`, "ChangeMe123!");
    const outsider = await createUser(`history-outsider-${unique}@example.test`, "ChangeMe123!");
    const bookingId = `booking-${unique}`;
    const relationshipId = buildKey(clientA.uid, clientB.uid, "booking", bookingId);

    try {
        await firestore.collection("bookings").doc(bookingId).set({
            proId: `pro-${unique}`,
            clientId: clientA.uid,
            start: "2026-11-02T09:00",
            end: "2026-11-02T10:00",
            status: "pending",
            createdBy: clientA.uid,
            createdAt: new Date()
        });

        // Before any consent record exists, B cannot read A's booking.
        assert.equal((await readBookingDirect(bookingId, clientB.idToken)).status, 403);

        // A cannot name themselves as the recipient, and cannot forge another UID as the requester.
        assert.equal((await writeRelationshipDirect(relationshipId, clientA.idToken, {
            requesterUid: clientA.uid, recipientUid: clientA.uid, scope: "booking", bookingId, status: "pending", requestedAt: new Date(), updatedAt: new Date()
        })).status, 403);
        assert.equal((await writeRelationshipDirect(relationshipId, clientA.idToken, {
            requesterUid: clientB.uid, recipientUid: clientB.uid, scope: "booking", bookingId, status: "pending", requestedAt: new Date(), updatedAt: new Date()
        })).status, 403);

        // A requests to share this booking's history with B.
        assert.equal((await writeRelationshipDirect(relationshipId, clientA.idToken, {
            requesterUid: clientA.uid, recipientUid: clientB.uid, scope: "booking", bookingId, status: "pending", requestedAt: new Date(), updatedAt: new Date()
        })).status, 200);

        // Pending is not yet granting access, and an outsider cannot read or act on the relationship.
        assert.equal((await readBookingDirect(bookingId, clientB.idToken)).status, 403);
        assert.equal((await readRelationshipDirect(relationshipId, outsider.idToken)).status, 403);
        assert.equal((await patchRelationshipDirect(relationshipId, outsider.idToken, { status: "revoked", revokedAt: new Date(), revokedBy: outsider.uid, updatedAt: new Date() }, ["status", "revokedAt", "revokedBy", "updatedAt"])).status, 403);

        // Only the named recipient may approve; the requester cannot self-approve.
        assert.equal((await patchRelationshipDirect(relationshipId, clientA.idToken, { status: "active", acceptedAt: new Date(), updatedAt: new Date() }, ["status", "acceptedAt", "updatedAt"])).status, 403);
        assert.equal((await patchRelationshipDirect(relationshipId, clientB.idToken, { status: "active", acceptedAt: new Date(), updatedAt: new Date() }, ["status", "acceptedAt", "updatedAt"])).status, 200);

        // Active consent grants B read access to A's booking; scope/UID fields remain immutable.
        assert.equal((await readBookingDirect(bookingId, clientB.idToken)).status, 200);
        assert.equal((await patchRelationshipDirect(relationshipId, clientB.idToken, { scope: "all" }, ["scope"])).status, 403);

        // Revocation is limited to the two named parties, and requires attributing the actor honestly.
        assert.equal((await patchRelationshipDirect(relationshipId, clientB.idToken, { status: "revoked", revokedAt: new Date(), revokedBy: clientA.uid, updatedAt: new Date() }, ["status", "revokedAt", "revokedBy", "updatedAt"])).status, 403);
        assert.equal((await patchRelationshipDirect(relationshipId, clientA.idToken, { status: "revoked", revokedAt: new Date(), revokedBy: clientA.uid, updatedAt: new Date() }, ["status", "revokedAt", "revokedBy", "updatedAt"])).status, 200);

        // After revocation, future reads are denied again, but the booking itself is untouched.
        assert.equal((await readBookingDirect(bookingId, clientB.idToken)).status, 403);
        assert.equal((await firestore.collection("bookings").doc(bookingId).get()).exists, true);
    } finally {
        await firestore.collection("clientRelationships").doc(relationshipId).delete().catch(() => {});
        await firestore.collection("bookings").doc(bookingId).delete().catch(() => {});
        const logs = await firestore.collection("logs").where("relationshipId", "==", relationshipId).get();
        await Promise.all(logs.docs.map((document) => document.ref.delete()));
        await app.auth().deleteUser(clientA.uid).catch(() => {});
        await app.auth().deleteUser(clientB.uid).catch(() => {});
        await app.auth().deleteUser(outsider.uid).catch(() => {});
        await app.delete();
    }
});

function buildKey(uidA, uidB, scope, scopeId) {
    const [first, second] = uidA < uidB ? [uidA, uidB] : [uidB, uidA];
    return `${first}_${second}_${scope}_${scopeId}`;
}

async function createUser(email, password) {
    const signup = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email, password, returnSecureToken: true });
    const signin = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email, password, returnSecureToken: true });
    return { uid: signup.localId, idToken: signin.idToken };
}

async function postJson(url, data) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    return response.json();
}

async function writeRelationshipDirect(documentId, idToken, values) {
    const fields = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, toFirestoreValue(value)]));
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/clientRelationships?documentId=${documentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields })
    });
}

async function patchRelationshipDirect(documentId, idToken, values, updateMask) {
    const query = updateMask.map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`).join("&");
    const fields = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, toFirestoreValue(value)]));
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/clientRelationships/${documentId}?${query}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields })
    });
}

async function readRelationshipDirect(documentId, idToken) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/clientRelationships/${documentId}`, {
        headers: { Authorization: `Bearer ${idToken}` }
    });
}

async function readBookingDirect(documentId, idToken) {
    return fetch(`http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents/bookings/${documentId}`, {
        headers: { Authorization: `Bearer ${idToken}` }
    });
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
