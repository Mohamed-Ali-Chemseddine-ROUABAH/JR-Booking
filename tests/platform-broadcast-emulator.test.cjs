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
const app = admin.initializeApp({ projectId }, `broadcast-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("admin queues a bounded client broadcast", { timeout: 30000 }, async () => {
    const suffix = crypto.randomUUID();
    const adminEmail = `broadcast-admin-${suffix}@example.test`;
    const proEmail = `broadcast-pro-${suffix}@example.test`;
    const clientEmail = `broadcast-client-${suffix}@example.test`;
    const password = "ChangeMe123!";
    let adminUid;
    let proUid;
    let clientUid;
    try {
        const adminAuth = await createUser(adminEmail, password);
        adminUid = adminAuth.localId;
        await app.auth().setCustomUserClaims(adminUid, { admin: true, role: "admin" });
        const proAuth = await createUser(proEmail, password);
        proUid = proAuth.localId;
        await app.auth().setCustomUserClaims(proUid, { professional: true, role: "professional" });
        const clientAuth = await createUser(clientEmail, password);
        clientUid = clientAuth.localId;
        const session = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email: adminEmail, password, returnSecureToken: true });
        const result = await callFunction("queuePlatformBroadcast", session.idToken, { audience: "clients", subject: "Maintenance", text: "Une maintenance est prévue." });
        assert.equal(result.recipientCount >= 1, true);
        const mail = await firestore.collection("mail").where("category", "==", "platform-broadcast").where("to", "==", clientEmail).limit(1).get();
        assert.equal(mail.empty, false);
        const proMail = await firestore.collection("mail").where("category", "==", "platform-broadcast").where("to", "==", proEmail).limit(1).get();
        assert.equal(proMail.empty, true);
        await assert.rejects(() => callFunction("queuePlatformBroadcast", clientAuth.idToken, { audience: "both", subject: "No", text: "No" }), /PERMISSION_DENIED|permission-denied/);
    } finally {
        if (adminUid) await app.auth().deleteUser(adminUid).catch(() => {});
        if (proUid) await app.auth().deleteUser(proUid).catch(() => {});
        if (clientUid) await app.auth().deleteUser(clientUid).catch(() => {});
    }
});

async function createUser(email, password) { return postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email, password, returnSecureToken: true }); }
async function callFunction(name, idToken, data) { const response = await fetch(`http://${functionsHost}/${projectId}/us-central1/${name}`, { method: "POST", headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ data }) }); const payload = await response.json(); if (!response.ok || payload.error) throw new Error(JSON.stringify(payload)); return payload.result; }
async function postJson(url, data) { const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); return response.json(); }
