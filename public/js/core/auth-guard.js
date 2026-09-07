import {
    createUserWithEmailAndPassword,
    getIdTokenResult,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirebaseAuth, isFirebaseConfigured, isUsingLocalFirebaseEmulators } from "./firebase-init.js";
import { UI_STRINGS } from "./strings-fr.js";

const ROLE_HOME_PATHS = {
    admin: "admin-dashboard.html",
    client: "client-dashboard.html",
    professional: "pro-dashboard.html"
};

export function isAuthConfigured() {
    return isFirebaseConfigured();
}

export function getRoleHomePath(role) {
    return ROLE_HOME_PATHS[role] || ROLE_HOME_PATHS.client;
}

export function watchAuthState(callback) {
    const auth = getFirebaseAuth();
    if (!auth) {
        callback(null);
        return () => {};
    }

    return onAuthStateChanged(auth, callback);
}

export async function signInWithEmail({ email, password }) {
    const auth = requireConfiguredAuth();
    return signInWithEmailAndPassword(auth, email, password);
}

export async function registerClientAccount({ email, password, displayName }) {
    const auth = requireConfiguredAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
        await updateProfile(credential.user, { displayName });
    }

    return credential;
}

export async function sendResetLink(email) {
    const auth = requireConfiguredAuth();
    return sendPasswordResetEmail(auth, email);
}

export async function signOutCurrentUser() {
    const auth = requireConfiguredAuth();
    return signOut(auth);
}

export async function getUserRole(user) {
    if (!user) {
        return "anonymous";
    }

    const tokenResult = await getIdTokenResult(user);
    const claimedRole = tokenResult.claims.role;

    if (claimedRole === "admin" || tokenResult.claims.admin === true) {
        return "admin";
    }

    if (claimedRole === "professional" || tokenResult.claims.professional === true) {
        return "professional";
    }

    if (claimedRole === "client" || tokenResult.claims.client === true) {
        return "client";
    }

    if (isUsingLocalFirebaseEmulators() && user.email === "pro.test@jr-booking-premium.local") {
        return "professional";
    }

    return "authenticated";
}

export function requireAuth({ allowedRoles = [], redirectTo = "login.html", onAuthorized } = {}) {
    return watchAuthState(async (user) => {
        if (!user) {
            window.location.assign(redirectTo);
            return;
        }

        const role = await getUserRole(user);
        const isAllowed = allowedRoles.length === 0
            || allowedRoles.includes(role)
            || allowedRoles.includes("authenticated");

        if (!isAllowed) {
            window.location.assign(getRoleHomePath(role));
            return;
        }

        onAuthorized?.({ user, role });
    });
}

export function getAuthErrorMessage(error) {
    return UI_STRINGS.auth.errors[error?.code] || UI_STRINGS.auth.errors.generic;
}

function requireConfiguredAuth() {
    const auth = getFirebaseAuth();
    if (!auth) {
        const error = new Error("Firebase Authentication is not configured.");
        error.code = "auth/unconfigured";
        throw error;
    }

    return auth;
}