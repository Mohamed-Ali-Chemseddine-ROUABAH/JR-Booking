const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
const functionsHost = process.env.FUNCTIONS_EMULATOR_HOST;
const projectId = process.env.FIREBASE_PROJECT_ID || "jr-booking-premium";
for (const host of [authHost, firestoreHost, functionsHost]) if (!host || !/^(localhost|127\.0\.0\.1):\d+$/.test(host)) throw new Error(`Local emulator host required: ${host || "missing"}`);
process.env.GCLOUD_PROJECT = projectId;
const admin = require("../functions/node_modules/firebase-admin");
const app = admin.initializeApp({ projectId }, `profile-purge-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("admin purges only an expired limbo profile", { timeout: 30000 }, async () => {
    const suffix = crypto.randomUUID();
    const adminEmail = `purge-admin-${suffix}@example.test`;
    const ownerEmail = `purge-owner-${suffix}@example.test`;
    const password = "ChangeMe123!";
    const profileId = `purge-profile-${suffix}`;
    let adminUid;
    let ownerUid;
    try {
        const adminAuth = await createUser(adminEmail, password);
        adminUid = adminAuth.localId;
        await app.auth().setCustomUserClaims(adminUid, { admin: true, role: "admin" });
        const ownerAuth = await createUser(ownerEmail, password);
        ownerUid = ownerAuth.localId;
        await app.auth().setCustomUserClaims(ownerUid, { professional: true, role: "professional" });
        await firestore.collection("proProfiles").doc(profileId).set({ owners: [ownerUid], accountStatus: "limbo", erasureRequest: { status: "pending", scheduledFor: new Date(Date.now() - 1000) } });
        await firestore.collection("publicProfiles").doc(profileId).set({ owners: [ownerUid], displayName: "To erase" });
        await firestore.collection("bookings").doc(`history-${suffix}`).set({ proId: profileId, status: "done" });
        const session = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email: adminEmail, password, returnSecureToken: true });
        await assert.rejects(() => callFunction("purgeProfessionalProfile", session.idToken, { profileId, confirmation: "SUPPRIMER CE PROFIL" }), /FAILED_PRECONDITION|failed-precondition/);
        const result = await callFunction("purgeProfessionalProfile", session.idToken, { profileId, confirmation: "SUPPRIMER DEFINITIVEMENT CE PROFIL" });
        assert.equal(result.status, "erased");
        assert.equal((await firestore.collection("proProfiles").doc(profileId).get()).exists, false);
        assert.equal((await firestore.collection("publicProfiles").doc(profileId).get()).exists, false);
        assert.equal((await firestore.collection("bookings").doc(`history-${suffix}`).get()).exists, true);
        await assert.rejects(() => app.auth().getUser(ownerUid), /user-not-found|There is no user record/i);
    } finally {
        await firestore.collection("proProfiles").doc(profileId).delete().catch(() => {});
        await firestore.collection("publicProfiles").doc(profileId).delete().catch(() => {});
        await firestore.collection("bookings").doc(`history-${suffix}`).delete().catch(() => {});
        if (adminUid) await app.auth().deleteUser(adminUid).catch(() => {});
        if (ownerUid) await app.auth().deleteUser(ownerUid).catch(() => {});
    }
});

async function createUser(email, password) { return postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email, password, returnSecureToken: true }); }
async function callFunction(name, idToken, data) { const response = await fetch(`http://${functionsHost}/${projectId}/us-central1/${name}`, { method: "POST", headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ data }) }); const payload = await response.json(); if (!response.ok || payload.error) throw new Error(JSON.stringify(payload)); return payload.result; }
async function postJson(url, data) { const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); return response.json(); }
