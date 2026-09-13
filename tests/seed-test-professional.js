/**
 * Creates one professional account in the Firebase Auth emulator for Phase 2 testing.
 * This script refuses to run unless FIREBASE_AUTH_EMULATOR_HOST is set.
 */

const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;

if (!authHost) {
    console.error("CRITICAL SECURITY ABORT: FIREBASE_AUTH_EMULATOR_HOST is not set.");
    console.error("Start the Auth emulator before running this script.");
    process.exit(1);
}

if (!/^localhost:\d+$|^127\.0\.0\.1:\d+$/.test(authHost)) {
    console.error(`CRITICAL SECURITY ABORT: refusing non-local Auth emulator host (${authHost}).`);
    process.exit(1);
}

const crypto = require("node:crypto");
const email = process.env.TEST_PRO_EMAIL || "pro.test@jr-booking-premium.local";
const password = process.env.TEST_PRO_PASSWORD || `Test-${crypto.randomUUID()}-Aa1!`;
const displayName = process.env.TEST_PRO_DISPLAY_NAME || "Professionnel Test";
const baseUrl = `http://${authHost}/identitytoolkit.googleapis.com/v1`;

process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || "jr-booking-premium";
const admin = require("../functions/node_modules/firebase-admin");
const app = admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });

async function main() {
    const user = await createOrFindUser();
    // Trusted callables check the real Auth custom claim, not the client-side email fallback.
    await app.auth().setCustomUserClaims(user.localId, { professional: true, role: "professional" });

    console.log("Test professional ready in the Auth emulator.");
    console.log(`User ID: ${user.localId}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("Custom claims set: { professional: true, role: \"professional\" }");
    console.log("Sign out and sign back in in the browser so the ID token picks up the claims.");
}

async function createOrFindUser() {
    const signUpResponse = await postJson(`${baseUrl}/accounts:signUp?key=fake-api-key`, {
        email,
        password,
        displayName,
        returnSecureToken: true
    });

    if (signUpResponse.localId) {
        return signUpResponse;
    }

    if (signUpResponse.error?.message !== "EMAIL_EXISTS") {
        throw new Error(signUpResponse.error?.message || "Unable to create test professional.");
    }

    const lookupResponse = await postJson(`${baseUrl}/accounts:signInWithPassword?key=fake-api-key`, {
        email,
        password,
        returnSecureToken: true
    });

    if (!lookupResponse.localId) {
        throw new Error(lookupResponse.error?.message || "Unable to find existing test professional.");
    }

    return lookupResponse;
}

async function postJson(url, payload) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    return response.json();
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});