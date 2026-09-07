import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { connectAuthEmulator, getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { connectFirestoreEmulator, getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let firebaseApp;
let firestore;
let firebaseAuth;

const LOCAL_FIREBASE_CONFIG = {
    apiKey: "fake-api-key",
    authDomain: "jr-booking-premium.localhost",
    projectId: "jr-booking-premium"
};

const LOCAL_EMULATORS = {
    auth: "http://127.0.0.1:9099",
    firestore: { host: "127.0.0.1", port: 8080 }
};

export function isFirebaseConfigured() {
    return Boolean(getFirebaseConfig()?.apiKey);
}

export function isUsingLocalFirebaseEmulators() {
    return isLocalHost() && !window.JR_BOOKING_FIREBASE_CONFIG?.apiKey;
}

export function getFirebaseApp() {
    const config = getFirebaseConfig();

    if (!config) {
        return null;
    }

    if (!firebaseApp) {
        firebaseApp = initializeApp(config);
    }

    return firebaseApp;
}

export function getFirestoreDb() {
    const app = getFirebaseApp();

    if (app && !firestore) {
        firestore = getFirestore(app);
        connectConfiguredFirestoreEmulator(firestore);
    }

    return firestore;
}

export function getFirebaseAuth() {
    const app = getFirebaseApp();

    if (app && !firebaseAuth) {
        firebaseAuth = getAuth(app);
        connectConfiguredAuthEmulator(firebaseAuth);
    }

    return firebaseAuth;
}

function connectConfiguredAuthEmulator(auth) {
    const authEmulator = getEmulatorConfig().auth;

    if (!authEmulator) {
        return;
    }

    const url = authEmulator === true ? "http://127.0.0.1:9099" : authEmulator;
    connectAuthEmulator(auth, url, { disableWarnings: true });
}

function connectConfiguredFirestoreEmulator(db) {
    const firestoreEmulator = getEmulatorConfig().firestore;

    if (!firestoreEmulator) {
        return;
    }

    const host = firestoreEmulator.host || "127.0.0.1";
    const port = firestoreEmulator.port || 8080;
    connectFirestoreEmulator(db, host, port);
}

function getFirebaseConfig() {
    if (window.JR_BOOKING_FIREBASE_CONFIG?.apiKey) {
        return window.JR_BOOKING_FIREBASE_CONFIG;
    }

    return isLocalHost() ? LOCAL_FIREBASE_CONFIG : null;
}

function getEmulatorConfig() {
    if (window.JR_BOOKING_EMULATORS) {
        return window.JR_BOOKING_EMULATORS;
    }

    return isUsingLocalFirebaseEmulators()
        ? LOCAL_EMULATORS
        : {};
}

function isLocalHost() {
    return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}
