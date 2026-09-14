/**
 * Seeds reusable professional/client fixtures into the Firebase emulators only.
 */
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
const projectId = process.env.FIREBASE_PROJECT_ID || "jr-booking-premium";

if (!authHost || !firestoreHost || !/^(localhost|127\.0\.0\.1):\d+$/.test(authHost) || !/^(localhost|127\.0\.0\.1):\d+$/.test(firestoreHost)) {
    console.error("CRITICAL SECURITY ABORT: local Auth and Firestore emulators are required.");
    process.exit(1);
}

process.env.GCLOUD_PROJECT = projectId;
const admin = require("../functions/node_modules/firebase-admin");
const { buildMockFixtures } = require("./mock-fixtures.cjs");
const app = admin.initializeApp({ projectId }, "mock-fixtures");

async function seed() {
    const fixtures = buildMockFixtures();
    for (const user of fixtures.users) {
        try {
            await app.auth().updateUser(user.uid, { email: user.email, password: "MockFixture-Aa1!", displayName: user.displayName });
        } catch (error) {
            if (error.code !== "auth/user-not-found") throw error;
            await app.auth().createUser({ uid: user.uid, email: user.email, password: "MockFixture-Aa1!", displayName: user.displayName });
        }
        await app.auth().setCustomUserClaims(user.uid, user.claims);
    }

    const database = app.firestore();
    const batch = database.batch();
    batch.set(database.collection("proProfiles").doc(fixtures.ids.professional), fixtures.proProfile, { merge: true });
    batch.set(database.collection("publicProfiles").doc(fixtures.ids.professional), fixtures.publicProfile, { merge: true });
    batch.set(database.collection("clientAccounts").doc(fixtures.ids.client), fixtures.clientAccount, { merge: true });
    fixtures.bookings.forEach((booking) => {
        const { id, ...data } = booking;
        batch.set(database.collection("bookings").doc(id), data, { merge: true });
    });
    await batch.commit();
    console.log(`Mock fixtures ready for ${fixtures.ids.professional} and ${fixtures.ids.client}.`);
}

seed().then(() => app.delete()).catch(async (error) => {
    console.error(error.message);
    await app.delete();
    process.exit(1);
});
