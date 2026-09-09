import { doc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirebaseAuth, getFirebaseStorage, getFirestoreDb } from "../core/firebase-init.js?v=phase13-storage-20260909";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDownloadURL, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const form = document.querySelector("[data-professional-request-form]");
const status = document.querySelector("[data-request-status]");
const submitButton = form.querySelector("button[type='submit']");
const maxFileSize = 10 * 1024 * 1024;
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

let authorizedUser;
onAuthStateChanged(getFirebaseAuth(), (user) => {
    if (!user) {
        window.location.assign("login.html");
        return;
    }
    authorizedUser = user;
    form.email.value = user.email || "";
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const user = authorizedUser || getFirebaseAuth()?.currentUser;
    const file = form.verificationFile.files[0];
    if (!user || !file) return;
    if (!allowedTypes.has(file.type) || file.size > maxFileSize) {
        status.textContent = "Le fichier doit être un PDF, JPEG ou PNG de 10 Mo maximum.";
        return;
    }
    submitButton.disabled = true;
    status.textContent = "Envoi de la demande...";
    let step = "upload";
    try {
        const fileRef = ref(getFirebaseStorage(), `professionalRequests/${user.uid}/${file.name}`);
        await uploadBytes(fileRef, file, { contentType: file.type });
        const fileUrl = await getDownloadURL(fileRef);
        step = "firestore";
        await setDoc(doc(getFirestoreDb(), "professionalRequests", user.uid), { createdBy: user.uid, email: user.email || form.email.value.trim(), displayName: form.displayName.value.trim(), description: form.description.value.trim(), verificationFile: { name: file.name, contentType: file.type, size: file.size, url: fileUrl }, status: "pending", createdAt: serverTimestamp() });
        form.reset();
        form.email.value = user.email || "";
        status.textContent = "Votre demande a été envoyée à l’administration.";
    } catch (error) {
        console.error("Professional request failed", { step, code: error?.code, message: error?.message });
        if (error?.code === "storage/unauthorized") {
            status.textContent = "Le justificatif n’est pas autorisé. Vérifiez que vous êtes connecté avec votre compte personnel.";
        } else if (error?.code === "permission-denied" || error?.code === "firestore/permission-denied") {
            status.textContent = "Firestore a refusé la demande. Reconnectez-vous puis réessayez.";
        } else if (error?.code === "storage/retry-limit-exceeded" || error?.message?.includes("ERR_BLOCKED_BY_CLIENT")) {
            status.textContent = "Un bloqueur de contenu empêche la connexion Firebase. Désactivez-le pour ce site puis réessayez.";
        } else if (step === "upload") {
            status.textContent = "L’envoi du justificatif a échoué. Autorisez Firebase Storage dans votre navigateur puis réessayez.";
        } else {
            status.textContent = "La demande n’a pas pu être enregistrée. Réessayez dans un instant.";
        }
    } finally {
        submitButton.disabled = false;
    }
});