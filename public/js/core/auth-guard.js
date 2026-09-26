import {
    createUserWithEmailAndPassword,
    deleteUser,
    getIdTokenResult,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    sendSignInLinkToEmail,
    signInWithEmailAndPassword,
    signInWithEmailLink,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirebaseAuth, isFirebaseConfigured, isUsingLocalFirebaseEmulators } from "./firebase-init.js";
import { buildEmailLinkContinuationUrl, normalizeEmailAddress, sanitizeAuthReturnTo } from "./email-link-utils.mjs?v=verified-booking-20260926";
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
    const credential = await signInWithEmailAndPassword(auth, normalizeEmailAddress(email), password);
    await credential.user.getIdToken(true);
    return credential;
}

export async function sendMagicLink({ email, returnTo } = {}) {
    const auth = requireConfiguredAuth();
    const normalizedEmail = normalizeEmailAddress(email);
    const actionCodeSettings = {
        url: buildEmailLinkContinuationUrl({
            origin: window.location.origin || "http://127.0.0.1:5000",
            path: "login.html",
            returnTo
        }),
        handleCodeInApp: false
    };

    await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
    return { email: normalizedEmail };
}

export async function completeMagicLinkSignIn({ email, url }) {
    const auth = requireConfiguredAuth();
    const normalizedEmail = normalizeEmailAddress(email);
    return signInWithEmailLink(auth, normalizedEmail, url);
}

export async function registerClientAccount({ email, password, displayName }) {
    const auth = requireConfiguredAuth();
    const credential = await createUserWithEmailAndPassword(auth, normalizeEmailAddress(email), password);

    if (displayName) {
        await updateProfile(credential.user, { displayName });
    }

    return credential;
}

export async function deleteCurrentUser() {
    const auth = requireConfiguredAuth();
    if (auth.currentUser) await deleteUser(auth.currentUser);
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

    // Force refresh so custom claims set after this session's last token issuance
    // (e.g. by an admin action) reach role checks and subsequent callable Functions.
    const tokenResult = await getIdTokenResult(user, true);
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

export async function sendClientVerificationEmail(user, returnTo) {
    const auth = requireConfiguredAuth();
    if (!user || auth.currentUser?.uid !== user.uid || !user.email) throw new Error("A signed-in client email is required.");
    const origin = window.location.origin;
    const safeReturnTo = sanitizeAuthReturnTo(returnTo, origin) || "login.html";
    const continueUrl = new URL(safeReturnTo, origin).toString();
    await sendEmailVerification(user, { url: continueUrl, handleCodeInApp: false });
    return { email: user.email };
}

export async function refreshClientEmailVerification(user) {
    if (!user) return false;
    await user.reload();
    await user.getIdToken(true);
    return user.emailVerified === true && Boolean(user.email);
}