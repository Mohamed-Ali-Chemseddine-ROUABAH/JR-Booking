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
const app = admin.initializeApp({ projectId }, `profile-lifecycle-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("admin schedules and cancels profile erasure", { timeout: 30000 }, async () => {
    const suffix = crypto.randomUUID();
    const adminEmail = `lifecycle-admin-${suffix}@example.test`;
    const ownerEmail = `lifecycle-owner-${suffix}@example.test`;
    const password = "ChangeMe123!";
    let adminUid;
    let ownerUid;
    const profileId = `lifecycle-${suffix}`;
    try {
        const adminAuth = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email: adminEmail, password, returnSecureToken: true });
        adminUid = adminAuth.localId;
        await app.auth().setCustomUserClaims(adminUid, { admin: true, role: "admin" });
        const ownerAuth = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email: ownerEmail, password, returnSecureToken: true });
        ownerUid = ownerAuth.localId;
        await app.auth().setCustomUserClaims(ownerUid, { professional: true, role: "professional" });
        await firestore.collection("proProfiles").doc(profileId).set({ owners: [ownerUid], accountStatus: "active" });
        const session = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email: adminEmail, password, returnSecureToken: true });
        await assert.rejects(() => callFunction("scheduleProfessionalProfileErasure", session.idToken, { profileId, confirmation: "wrong" }), /FAILED_PRECONDITION|failed-precondition/);
        const scheduled = await callFunction("scheduleProfessionalProfileErasure", session.idToken, { profileId, confirmation: "SUPPRIMER CE PROFIL" });
        assert.equal(scheduled.status, "limbo");
        assert.equal((await firestore.collection("proProfiles").doc(profileId).get()).data().accountStatus, "limbo");
        assert.equal((await app.auth().getUser(ownerUid)).disabled, true);
        const cancelled = await callFunction("cancelProfessionalProfileErasure", session.idToken, { profileId });
        assert.equal(cancelled.status, "active");
        assert.equal((await app.auth().getUser(ownerUid)).disabled, false);
    } finally {
        await firestore.collection("proProfiles").doc(profileId).delete().catch(() => {});
        if (adminUid) await app.auth().deleteUser(adminUid).catch(() => {});
        if (ownerUid) await app.auth().deleteUser(ownerUid).catch(() => {});
    }
});

async function callFunction(name, idToken, data) { const response = await fetch(`http://${functionsHost}/${projectId}/us-central1/${name}`, { method: "POST", headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ data }) }); const payload = await response.json(); if (!response.ok || payload.error) throw new Error(JSON.stringify(payload)); return payload.result; }
async function postJson(url, data) { const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); return response.json(); }
