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
const app = admin.initializeApp({ projectId }, `bulk-review-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("admin reviews professional applications in bulk", { timeout: 30000 }, async () => {
    const suffix = crypto.randomUUID();
    const adminEmail = `bulk-admin-${suffix}@example.test`;
    const clientEmail = `bulk-client-${suffix}@example.test`;
    const password = process.env.TEST_PASSWORD || `Test-${crypto.randomUUID()}-Aa1!`;
    let adminUid;
    let clientUid;
    const requestIds = [`bulk-request-a-${suffix}`, `bulk-request-b-${suffix}`];
    try {
        const adminAuth = await createUser(adminEmail, password);
        adminUid = adminAuth.localId;
        await app.auth().setCustomUserClaims(adminUid, { admin: true, role: "admin" });
        const clientAuth = await createUser(clientEmail, password);
        clientUid = clientAuth.localId;
        await Promise.all(requestIds.map((id) => firestore.collection("professionalRequests").doc(id).set({ status: "pending-review", email: `${id}@example.test` })));
        const session = await postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email: adminEmail, password, returnSecureToken: true });
        const result = await callFunction("bulkReviewProfessionalApplications", session.idToken, { requestIds, decision: "rejected" });
        assert.equal(result.reviewedCount, 2);
        for (const id of requestIds) assert.equal((await firestore.collection("professionalRequests").doc(id).get()).data().status, "rejected");
        await assert.rejects(() => callFunction("bulkReviewProfessionalApplications", clientAuth.idToken, { requestIds, decision: "approved" }), /PERMISSION_DENIED|permission-denied/);
    } finally {
        await Promise.all(requestIds.map((id) => firestore.collection("professionalRequests").doc(id).delete().catch(() => {})));
        if (adminUid) await app.auth().deleteUser(adminUid).catch(() => {});
        if (clientUid) await app.auth().deleteUser(clientUid).catch(() => {});
    }
});

async function createUser(email, password) { return postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email, password, returnSecureToken: true }); }
async function callFunction(name, idToken, data) { const response = await fetch(`http://${functionsHost}/${projectId}/us-central1/${name}`, { method: "POST", headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ data }) }); const payload = await response.json(); if (!response.ok || payload.error) throw new Error(JSON.stringify(payload)); return payload.result; }
async function postJson(url, data) { const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); return response.json(); }
