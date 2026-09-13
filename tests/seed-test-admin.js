/**
 * Creates one admin account with a local Auth emulator custom claim for Phase 13 testing.
 * This script refuses to run unless FIREBASE_AUTH_EMULATOR_HOST is set to localhost.
 */

const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
if (!authHost || !/^localhost:\d+$|^127\.0\.0\.1:\d+$/.test(authHost)) {
    console.error("CRITICAL SECURITY ABORT: local Firebase Auth emulator is required.");
    process.exit(1);
}

const crypto = require("node:crypto");
const admin = require("../functions/node_modules/firebase-admin");
const email = process.env.TEST_ADMIN_EMAIL || "admin.test@jr-booking-premium.local";
const password = process.env.TEST_ADMIN_PASSWORD || `Test-${crypto.randomUUID()}-Aa1!`;
const projectId = process.env.FIREBASE_PROJECT_ID || "jr-booking-premium";
admin.initializeApp({ projectId });

async function main() {
    let account;
    try {
        account = await admin.auth().getUserByEmail(email);
    } catch (error) {
        if (error.code !== "auth/user-not-found") throw error;
        account = await admin.auth().createUser({ email, password });
    }
    await admin.auth().updateUser(account.uid, { password });
    await admin.auth().setCustomUserClaims(account.uid, { admin: true, role: "admin" });

    console.log("Test admin ready in the Auth emulator.");
    console.log(`User ID: ${account.uid}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("Claims: admin=true, role=admin");
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
