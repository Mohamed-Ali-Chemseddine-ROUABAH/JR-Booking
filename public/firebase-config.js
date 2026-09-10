window.JR_BOOKING_FIREBASE_CONFIG = {
    apiKey: "AIzaSyBDTS9B8P5fIBXteKz94yFtXsnKm31lAd8",
    authDomain: "jr-booking-premium.firebaseapp.com",
    projectId: "jr-booking-premium",
    storageBucket: "jr-booking-premium.firebasestorage.app",
    messagingSenderId: "919760911069",
    appId: "1:919760911069:web:7cc8ceaf846b07ae903934",
    measurementId: "G-QJD4Q3FCNH"
};

if (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)) {
    window.JR_BOOKING_EMULATORS = {
        auth: "http://127.0.0.1:9099",
        firestore: { host: "127.0.0.1", port: 8080 },
        functions: { host: "127.0.0.1", port: 5001 },
        storage: { host: "127.0.0.1", port: 9199 }
    };
}
