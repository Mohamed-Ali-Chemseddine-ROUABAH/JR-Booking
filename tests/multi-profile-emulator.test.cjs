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
const app = admin.initializeApp({ projectId }, `multi-profile-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("admin creates an additional owned professional profile", { timeout: 30000 }, async () => {
    const suffix = crypto.randomUUID();
    const adminEmail = `profiles-admin-${suffix}@example.test`;
    const ownerEmail = `profiles-owner-${suffix}@example.test`;
    const password = process.env.TEST_PASSWORD || `Test-${crypto.randomUUID()}-Aa1!`;
    let adminUid;
    let ownerUid;
    let profileId;
    try {
        const adminAuth = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email: adminEmail, password, returnSecureToken: true });
        adminUid = adminAuth.localId;
        await app.auth().setCustomUserClaims(adminUid, { admin: true, role: "admin" });
        const ownerAuth = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email: ownerEmail, password, returnSecureToken: true });
        ownerUid = ownerAuth.localId;
        await app.auth().setCustomUserClaims(ownerUid, { professional: true, role: "professional" });
        const adminSession = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email: adminEmail, password, returnSecureToken: true });
        const result = await callFunction("createAdditionalProfessionalProfile", adminSession.idToken, { ownerUid, displayName: "Profil secondaire", description: "Description secondaire" });
        profileId = result.profileId;
        assert.equal(result.ownerUid, ownerUid);
        const profile = (await firestore.collection("proProfiles").doc(profileId).get()).data();
        const publicProfile = (await firestore.collection("publicProfiles").doc(profileId).get()).data();
        assert.deepEqual(profile.owners, [ownerUid]);
        assert.equal(publicProfile.displayName, "Profil secondaire");
        assert.equal((await firestore.collection("proProfiles").where("owners", "array-contains", ownerUid).get()).empty, false);
        await assert.rejects(() => callFunction("createAdditionalProfessionalProfile", ownerAuth.idToken, { ownerUid, displayName: "Denied" }), /PERMISSION_DENIED|permission-denied/);
    } finally {
        if (profileId) {
            await firestore.collection("proProfiles").doc(profileId).delete().catch(() => {});
            await firestore.collection("publicProfiles").doc(profileId).delete().catch(() => {});
        }
        if (adminUid) await app.auth().deleteUser(adminUid).catch(() => {});
        if (ownerUid) await app.auth().deleteUser(ownerUid).catch(() => {});
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
