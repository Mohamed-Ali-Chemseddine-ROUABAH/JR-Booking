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
const app = admin.initializeApp({ projectId }, `booking-claims-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("verified booking claim lifecycle", { timeout: 45000 }, async () => {
    const suffix = crypto.randomUUID();
    const createdUids = [];
    const bookingIds = [];
    const professional = await createUser(`pro-${suffix}@example.test`, { professional: true, role: "professional" });
    const client = await createUser(`client-${suffix}@example.test`, {});
    const otherClient = await createUser(`other-${suffix}@example.test`, {});
    const administrator = await createUser(`admin-${suffix}@example.test`, { admin: true, role: "admin" });
    createdUids.push(professional.uid, client.uid, otherClient.uid, administrator.uid);

    try {
        await firestore.collection("proProfiles").doc(professional.uid).set({ owners: [professional.uid], accountStatus: "active", displayName: "Professionnel Claim" });

        const bookingId = await createBooking(professional, client.email, `claim-${suffix}`);
        bookingIds.push(bookingId);
        const issued = await issueClaim(professional, bookingId);
        assert.equal(issued.status, "email_queued");
        const rawToken = await readClaimTokenFromMail(bookingId);

        await assert.rejects(() => callFunction("previewBookingClaim", otherClient.idToken, { bookingId, token: rawToken }), /PERMISSION_DENIED|permission-denied/);
        const tokenRef = firestore.collection("bookingClaimTokens").doc(hash(rawToken));
        assert.equal((await tokenRef.get()).data().attemptCount, 1);

        const preview = await callFunction("previewBookingClaim", client.idToken, { bookingId, token: rawToken });
        assert.equal(preview.contactRole, "primary");
        assert.equal(preview.professionalName, "Professionnel Claim");
        assert.equal(preview.proId, undefined);
        assert.equal(preview.bookingId, bookingId);

        const claimed = await callFunction("resolveBookingClaim", client.idToken, { bookingId, token: rawToken, action: "accept", requestId: crypto.randomUUID() });
        assert.equal(claimed.status, "claimed");
        assert.equal(claimed.grantsBookingAccess, true);
        const claimedBooking = (await firestore.collection("bookings").doc(bookingId).get()).data();
        assert.equal(claimedBooking.clientId, client.uid);
        assert.equal(claimedBooking.contacts[0].linkedUid, client.uid);
        await assert.rejects(() => callFunction("resolveBookingClaim", client.idToken, { bookingId, token: rawToken, action: "accept", requestId: crypto.randomUUID() }), /FAILED_PRECONDITION|failed-precondition/);

        const unlinked = await callFunction("unlinkBookingClaim", client.idToken, { bookingId, contactId: claimedBooking.contacts[0].contactId, requestId: crypto.randomUUID() });
        assert.equal(unlinked.status, "unlinked");
        assert.equal((await firestore.collection("bookings").doc(bookingId).get()).data().clientId, null);

        const rejectIssue = await issueClaim(professional, bookingId);
        assert.equal(rejectIssue.status, "email_queued");
        const rejectToken = await readClaimTokenFromMail(bookingId, rawToken);
        const rejected = await callFunction("resolveBookingClaim", client.idToken, { bookingId, token: rejectToken, action: "reject", requestId: crypto.randomUUID() });
        assert.equal(rejected.status, "rejected");

        const expiredBookingId = await createBooking(professional, client.email, `expired-${suffix}`);
        bookingIds.push(expiredBookingId);
        await issueClaim(professional, expiredBookingId);
        const expiredToken = await readClaimTokenFromMail(expiredBookingId);
        await firestore.collection("bookingClaimTokens").doc(hash(expiredToken)).update({ expiresAt: new Date(Date.now() - 1000) });
        await assert.rejects(() => callFunction("previewBookingClaim", client.idToken, { bookingId: expiredBookingId, token: expiredToken }), /FAILED_PRECONDITION|failed-precondition/);

        const conflictBookingId = await createBooking(professional, client.email, `conflict-${suffix}`);
        bookingIds.push(conflictBookingId);
        await firestore.collection("bookings").doc(conflictBookingId).update({ clientId: otherClient.uid });
        await issueClaim(professional, conflictBookingId);
        const conflictToken = await readClaimTokenFromMail(conflictBookingId);
        const conflict = await callFunction("resolveBookingClaim", client.idToken, { bookingId: conflictBookingId, token: conflictToken, action: "accept", requestId: crypto.randomUUID() });
        assert.equal(conflict.status, "review-required");
        assert.equal((await firestore.collection("bookings").doc(conflictBookingId).get()).data().claimConflict.reasonCode, "booking-role-linked-to-another-account");
        const conflictContact = (await firestore.collection("bookings").doc(conflictBookingId).get()).data().contacts[0];
        await assert.rejects(() => callFunction("listBookingClaimConflicts", client.idToken, {}), /PERMISSION_DENIED|permission-denied/);
        const conflictList = await callFunction("listBookingClaimConflicts", administrator.idToken, {});
        const listedConflict = conflictList.conflicts.find((item) => item.bookingId === conflictBookingId);
        assert.deepEqual(Object.keys(listedConflict).sort(), ["bookingId", "contactId", "createdAt", "professionalName", "reasonCode"]);
        assert.equal(listedConflict.contactId, conflictContact.contactId);
        assert.equal(listedConflict.reasonCode, "booking-role-linked-to-another-account");
        const resolved = await callFunction("resolveBookingClaimConflict", administrator.idToken, { bookingId: conflictBookingId, contactId: conflictContact.contactId, approve: true, requestId: crypto.randomUUID() });
        assert.equal(resolved.status, "claimed");
        assert.equal((await firestore.collection("bookings").doc(conflictBookingId).get()).data().clientId, client.uid);

        const eventSnapshot = await firestore.collection("logs").where("bookingId", "in", bookingIds).get();
        const eventTypes = new Set(eventSnapshot.docs.map((document) => document.data().type).filter(Boolean));
        for (const type of ["booking-claim-requested", "booking-claim-succeeded", "booking-claim-rejected", "booking-claim-conflict", "booking-claim-conflict-resolved", "booking-claim-unlinked"]) {
            assert.ok(eventTypes.has(type), `Missing audit event ${type}`);
        }
    } finally {
        await cleanup(bookingIds, createdUids);
        await app.delete();
    }
});

async function createUser(email, claims) {
    const password = process.env.TEST_PASSWORD || `Test-${crypto.randomUUID()}-Aa1!`;
    const signup = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email, password, returnSecureToken: true });
    await app.auth().updateUser(signup.localId, { emailVerified: true });
    await app.auth().setCustomUserClaims(signup.localId, claims);
    const signin = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email, password, returnSecureToken: true });
    return { uid: signup.localId, email, idToken: signin.idToken };
}

async function createBooking(professional, clientEmail, requestId) {
    const result = await callFunction("createProfessionalBooking", professional.idToken, {
        requestId,
        proId: professional.uid,
        start: "2026-09-20T09:00",
        end: "2026-09-20T10:00",
        contacts: [{ name: "Client Claim", email: clientEmail, role: "primary", notify: true }]
    });
    return result.bookingId;
}

async function issueClaim(professional, bookingId) {
    const booking = (await firestore.collection("bookings").doc(bookingId).get()).data();
    return callFunction("issueBookingClaim", professional.idToken, { bookingId, contactId: booking.contacts[0].contactId, requestId: crypto.randomUUID() });
}

async function readClaimTokenFromMail(bookingId, excludedToken = null) {
    const snapshot = await firestore.collection("mail").where("sourceId", "==", bookingId).get();
    const tokens = snapshot.docs.map((document) => document.data().message?.text?.match(/[a-f0-9]{64}/)?.[0]).filter(Boolean);
    const token = tokens.find((value) => value !== excludedToken);
    assert.ok(token, `Claim token mail missing for ${bookingId}`);
    return token;
}

async function cleanup(bookingIds, uids) {
    for (const bookingId of bookingIds) {
        const collections = ["bookingClaimTokens", "logs", "mail"];
        for (const collectionName of collections) {
            const snapshot = await firestore.collection(collectionName).where(collectionName === "bookingClaimTokens" ? "bookingId" : "sourceId", "==", bookingId).get().catch(() => null);
            if (snapshot) await Promise.all(snapshot.docs.map((document) => document.ref.delete()));
        }
        const logs = await firestore.collection("logs").where("bookingId", "==", bookingId).get();
        await Promise.all(logs.docs.map((document) => document.ref.delete()));
        await firestore.collection("bookings").doc(bookingId).delete();
    }
    await Promise.all(uids.map(async (uid) => {
        await firestore.collection("proProfiles").doc(uid).delete().catch(() => {});
        await app.auth().deleteUser(uid).catch(() => {});
    }));
}

function hash(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
}

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