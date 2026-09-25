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
const app = admin.initializeApp({ projectId }, `application-verification-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("admin can reissue verification only for an unverified professional application", { timeout: 30000 }, async () => {
    const suffix = crypto.randomUUID();
    const adminEmail = `verification-admin-${suffix}@example.test`;
    const userEmail = `verification-user-${suffix}@example.test`;
    const password = process.env.TEST_PASSWORD || `Test-${crypto.randomUUID()}-Aa1!`;
    const requestId = `verification-request-${suffix}`;
    const requestRef = firestore.collection("professionalRequests").doc(requestId);
    let adminUid;
    let userUid;
    try {
        const adminAuth = await createUser(adminEmail, password);
        adminUid = adminAuth.localId;
        await app.auth().setCustomUserClaims(adminUid, { admin: true, role: "admin" });
        const userAuth = await createUser(userEmail, password);
        userUid = userAuth.localId;
        const adminSession = await signIn(adminEmail, password);
        const userSession = await signIn(userEmail, password);
        const createdAt = new Date(Date.now() - 10 * 60 * 1000);
        const oldHash = crypto.createHash("sha256").update("old-verification-token").digest("hex");
        await requestRef.set({
            email: userEmail,
            displayName: "Test Applicant",
            description: "Emulator verification test",
            status: "awaiting-email-verification",
            emailVerificationStatus: "pending",
            verificationTokenHash: oldHash,
            verificationExpiresAt: new Date(Date.now() - 1000),
            createdAt
        });

        await assert.rejects(
            () => callFunction("resendProfessionalApplicationVerification", userSession.idToken, { requestId }),
            /PERMISSION_DENIED|permission-denied/
        );

        const result = await callFunction("resendProfessionalApplicationVerification", adminSession.idToken, { requestId });
        assert.equal(result.status, "email_queued");
        assert.equal(result.resendCount, 1);

        const request = (await requestRef.get()).data();
        assert.notEqual(request.verificationTokenHash, oldHash);
        assert.ok(request.verificationExpiresAt.toDate() > new Date());
        assert.equal(request.verificationResendCount, 1);

        const mailSnapshot = await firestore.collection("mail").where("sourceId", "==", requestId).get();
        assert.equal(mailSnapshot.size, 1);
        const mail = mailSnapshot.docs[0].data();
        assert.equal(mail.to, userEmail);
        assert.equal(mail.templateId, "professional-application-verification");
        const token = new URL(mail.message.text.match(/https:\/\/[^\s]+/)[0]).searchParams.get("token");
        assert.equal(crypto.createHash("sha256").update(token).digest("hex"), request.verificationTokenHash);

        await assert.rejects(
            () => callFunction("resendProfessionalApplicationVerification", adminSession.idToken, { requestId }),
            /RESOURCE_EXHAUSTED|resource-exhausted/
        );
        await requestRef.update({ status: "pending-review", emailVerificationStatus: "verified" });
        await assert.rejects(
            () => callFunction("resendProfessionalApplicationVerification", adminSession.idToken, { requestId }),
            /FAILED_PRECONDITION|failed-precondition/
        );
        assert.equal((await firestore.collection("mail").where("sourceId", "==", requestId).get()).size, 1);
    } finally {
        const mailSnapshot = await firestore.collection("mail").where("sourceId", "==", requestId).get();
        await Promise.all(mailSnapshot.docs.map((document) => document.ref.delete()));
        const auditSnapshot = await firestore.collection("logs").where("applicationId", "==", requestId).get();
        await Promise.all(auditSnapshot.docs.map((document) => document.ref.delete()));
        await requestRef.delete().catch(() => {});
        if (adminUid) await app.auth().deleteUser(adminUid).catch(() => {});
        if (userUid) await app.auth().deleteUser(userUid).catch(() => {});
    }
});

async function createUser(email, password) {
    return postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, { email, password, returnSecureToken: true });
}

async function signIn(email, password) {
    return postJson(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`, { email, password, returnSecureToken: true });
}

async function callFunction(name, idToken, data) {
    const response = await fetch(`http://${functionsHost}/${projectId}/us-central1/${name}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ data })
    });
    const payload = await response.json();
    if (!response.ok || payload.error) throw new Error(JSON.stringify(payload));
    return payload.result;
}

async function postJson(url, data) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    return response.json();
}