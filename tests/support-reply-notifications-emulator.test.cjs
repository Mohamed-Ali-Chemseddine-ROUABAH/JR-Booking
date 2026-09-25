const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
const functionsHost = process.env.FUNCTIONS_EMULATOR_HOST;
const projectId = process.env.FIREBASE_PROJECT_ID || "jr-booking-premium";
for (const host of [firestoreHost, functionsHost]) {
    if (!host || !/^(localhost|127\.0\.0\.1):\d+$/.test(host)) throw new Error(`Local emulator host required: ${host || "missing"}`);
}

process.env.GCLOUD_PROJECT = projectId;
const admin = require("../functions/node_modules/firebase-admin");
const app = admin.initializeApp({ projectId }, `support-reply-${crypto.randomUUID()}`);
const firestore = app.firestore();

test("support and data-request replies notify the creator", { timeout: 30000 }, async () => {
    const suffix = crypto.randomUUID();
    const creatorUid = `requester-${suffix}`;
    const ticketId = `ticket-${suffix}`;
    const requestId = `data-request-${suffix}`;
    const ticket = firestore.collection("supportTickets").doc(ticketId);
    const dataRequest = firestore.collection("dataRequests").doc(requestId);
    try {
        await ticket.set({ createdBy: creatorUid, subject: "Help", details: "Details", status: "pending", createdAt: new Date(), updatedAt: new Date() });
        await dataRequest.set({ createdBy: creatorUid, subject: "Export", details: "My data", status: "pending", createdAt: new Date(), updatedAt: new Date() });
        await ticket.update({ adminReply: "Support answer", status: "in-progress", updatedAt: new Date() });
        await dataRequest.update({ adminReply: "Data answer", status: "in-progress", updatedAt: new Date() });
        const [supportNotification, dataNotification] = await Promise.all([
            waitForNotification(creatorUid, `support-reply-${ticketId}`),
            waitForNotification(creatorUid, `data-request-reply-${requestId}`)
        ]);
        assert.equal(supportNotification.data().type, "support-ticket-reply");
        assert.equal(dataNotification.data().type, "data-request-reply");
        assert.equal(supportNotification.data().body, "Support answer");
        assert.equal(dataNotification.data().body, "Data answer");
    } finally {
        await Promise.all([ticket.delete(), dataRequest.delete()]);
        const notifications = await firestore.collection("notifications").doc(creatorUid).collection("items").get();
        await Promise.all(notifications.docs.map((document) => document.ref.delete()));
    }
});

async function waitForNotification(uid, id) {
    const reference = firestore.collection("notifications").doc(uid).collection("items").doc(id);
    for (let attempt = 0; attempt < 80; attempt += 1) {
        const snapshot = await reference.get();
        if (snapshot.exists) return snapshot;
        await new Promise((resolve) => setTimeout(resolve, 250));
    }
    assert.fail(`Notification ${id} was not created`);
}
