/**
 * Safeguard for local testing.
 * The Master Specification strictly dictates that tests must never hit production data.
 * This script will immediately abort if it detects it is running against a live project without the emulator.
 */

const isEmulator = process.env.FIREBASE_EMULATOR_HUB || process.env.FIRESTORE_EMULATOR_HOST;

if (!isEmulator) {
    console.error("âŒ CRITICAL SECURITY ABORT: Firebase Emulator environment variables are not set.");
    console.error("Local testing scripts must only be run against the Local Emulator Suite.");
    process.exit(1);
}

console.log("âœ… Emulator detected. Safe to seed mock data.");
// TODO: Seeding logic will be added here in future phases.
