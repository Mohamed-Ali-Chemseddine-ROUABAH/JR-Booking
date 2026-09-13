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
const app = admin.initializeApp({ projectId }, `account-recovery-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("admin account recovery preserves linked data", { timeout: 30000 }, async () => {
    const suffix = crypto.randomUUID();
    const adminEmail = `recovery-admin-${suffix}@example.test`;
    const userEmail = `recovery-user-${suffix}@example.test`;
    const password = "ChangeMe123!";
    let adminUid;
    let userUid;
    try {
        const adminAuth = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email: adminEmail, password, returnSecureToken: true });
        adminUid = adminAuth.localId;
        await app.auth().setCustomUserClaims(adminUid, { admin: true, role: "admin" });
        const userAuth = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email: userEmail, password, returnSecureToken: true });
        userUid = userAuth.localId;
        await firestore.collection("proProfiles").doc(userUid).set({ owners: [userUid], accountStatus: "active", displayName: "Recovery User" });
        const adminSession = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email: adminEmail, password, returnSecureToken: true });
        const result = await callFunction("issueAccountRecovery", adminSession.idToken, { targetEmail: userEmail });
        assert.equal(result.targetUid, userUid);
        assert.equal(result.preservedData, true);
        assert.equal(result.status, "email_queued");
        assert.equal((await firestore.collection("proProfiles").doc(userUid).get()).exists, true);
        const mail = await firestore.collection("mail").where("sourceId", "==", userUid).where("category", "==", "account-recovery").limit(1).get();
        assert.equal(mail.empty, false);
        assert.equal(mail.docs[0].data().to, userEmail);
        await assert.rejects(() => callFunction("issueAccountRecovery", userAuth.idToken, { targetUid: userUid }), /PERMISSION_DENIED|permission-denied/);
    } finally {
        if (userUid) await firestore.collection("proProfiles").doc(userUid).delete().catch(() => {});
        if (adminUid) await app.auth().deleteUser(adminUid).catch(() => {});
        if (userUid) await app.auth().deleteUser(userUid).catch(() => {});
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
