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
const app = admin.initializeApp({ projectId }, `creation-links-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("admin creation link lifecycle", { timeout: 30000 }, async () => {
    const suffix = crypto.randomUUID();
    const adminEmail = `creation-admin-${suffix}@example.test`;
    const proEmail = `creation-pro-${suffix}@example.test`;
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || `Test-${crypto.randomUUID()}-Aa1!`;
    const proPassword = "ProPass123!";
    let adminUid;
    let linkId;
    try {
        const adminAuth = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email: adminEmail, password: adminPassword, returnSecureToken: true });
        adminUid = adminAuth.localId;
        await app.auth().setCustomUserClaims(adminUid, { admin: true, role: "admin" });
        const adminSession = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email: adminEmail, password: adminPassword, returnSecureToken: true });
        const issued = await callFunction("createProfessionalCreationLink", adminSession.idToken, { email: proEmail, maxUses: 1, expiresInDays: 7 });
        assert.match(issued.url, /register-professional\.html\?token=/);
        linkId = issued.linkId;
        const stored = (await firestore.collection("creationLinks").doc(linkId).get()).data();
        assert.equal(stored.email, proEmail);
        assert.equal(stored.remainingUses, 1);
        assert.equal(stored.tokenHash.length, 64);
        assert.equal(stored.tokenHash.includes(new URL(issued.url).searchParams.get("token")), false);

        const redeemed = await callFunction("redeemProfessionalCreationLink", null, { token: new URL(issued.url).searchParams.get("token"), displayName: "Professionnel Creation", password: proPassword });
        assert.equal(redeemed.email, proEmail);
        const created = await app.auth().getUserByEmail(proEmail);
        assert.equal(created.customClaims.professional, true);
        assert.equal((await firestore.collection("proProfiles").doc(created.uid).get()).exists, true);
        assert.equal((await firestore.collection("creationLinks").doc(linkId).get()).data().status, "exhausted");
        await assert.rejects(() => callFunction("redeemProfessionalCreationLink", null, { token: new URL(issued.url).searchParams.get("token"), displayName: "Replay", password: proPassword }), /FAILED_PRECONDITION|PERMISSION_DENIED|failed-precondition|permission-denied/);
    } finally {
        if (linkId) await firestore.collection("creationLinks").doc(linkId).delete().catch(() => {});
        const user = await app.auth().getUserByEmail(proEmail).catch(() => null);
        if (user) {
            await firestore.collection("proProfiles").doc(user.uid).delete().catch(() => {});
            await firestore.collection("publicProfiles").doc(user.uid).delete().catch(() => {});
            await app.auth().deleteUser(user.uid).catch(() => {});
        }
        if (adminUid) await app.auth().deleteUser(adminUid).catch(() => {});
    }
});

async function callFunction(name, idToken, data) {
    const headers = { "Content-Type": "application/json" };
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    const response = await fetch(`http://${functionsHost}/${projectId}/us-central1/${name}`, { method: "POST", headers, body: JSON.stringify({ data }) });
    const payload = await response.json();
    if (!response.ok || payload.error) throw new Error(JSON.stringify(payload));
    return payload.result;
}

async function postJson(url, data) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    return response.json();
}
