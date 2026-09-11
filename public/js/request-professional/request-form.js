import { doc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirebaseAuth, getFirebaseStorage, getFirestoreDb } from "../core/firebase-init.js?v=phase13-storage-20260909";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDownloadURL, ref, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const form = document.querySelector("[data-professional-request-form]");
const status = form.querySelector("[data-request-status]");
const fileStatus = form.querySelector("[data-file-status]");
const submitButton = form.querySelector("button[type='submit']");
const fileInput = form.querySelector("[name='verificationFile']");
const maxFileSize = 10 * 1024 * 1024;
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    fileStatus.textContent = file ? `Document selectionne : ${file.name}` : "PDF, JPEG ou PNG · 10 Mo maximum.";
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = fileInput.files[0];
    if (!file) {
        status.textContent = "Sélectionnez votre justificatif avant l'envoi.";
        return;
    }
    if (!allowedTypes.has(file.type) || file.size > maxFileSize) {
        status.textContent = "Le fichier doit être un PDF, JPEG ou PNG de 10 Mo maximum.";
        return;
    }

    submitButton.disabled = true;
    status.textContent = "Envoi de la demande...";
    fileStatus.textContent = "Envoi du justificatif : 0 %";
    const data = new FormData(form);
    const request = new XMLHttpRequest();
    request.open("POST", getApplicationEndpoint());
    request.upload.addEventListener("progress", (progress) => {
        if (progress.lengthComputable) fileStatus.textContent = `Envoi du justificatif : ${Math.round(progress.loaded / progress.total * 100)} %`;
    });
    request.addEventListener("load", () => {
        let result = {};
        try { result = JSON.parse(request.responseText); } catch { /* use generic error */ }
        if (request.status === 202) {
            fileStatus.textContent = "Justificatif reçu.";
            status.textContent = "Demande reçue. Consultez votre email pour confirmer votre adresse.";
            form.reset();
            return;
        }
        status.textContent = result.error === "invalid_application" ? "Vérifiez les champs et le justificatif." : "La demande n'a pas pu être enregistrée. Réessayez.";
    });
    request.addEventListener("error", () => { status.textContent = "Le service est momentanément indisponible. Réessayez."; });
    request.addEventListener("loadend", () => { submitButton.disabled = false; });
    request.send(data);
});

function getApplicationEndpoint() {
    if (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)) {
        return "http://127.0.0.1:5001/jr-booking-premium/us-central1/submitProfessionalApplication";
    }
    return "https://us-central1-jr-booking-premium.cloudfunctions.net/submitProfessionalApplication";
}
const fileStatus = form.querySelector("[data-file-status]");
const maxFileSize = 10 * 1024 * 1024;
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

let authorizedUser;
form.verificationFile.addEventListener("change", () => {
    const file = form.verificationFile.files[0];
    fileStatus.textContent = file ? `Document selectionne : ${file.name}` : "PDF, JPEG ou PNG · 10 Mo maximum.";
});

onAuthStateChanged(getFirebaseAuth(), (user) => {
    authorizedUser = user;
    if (user) {
        form.email.value = user.email || "";
    }
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const user = authorizedUser || getFirebaseAuth()?.currentUser;
    const file = form.verificationFile.files[0];
    if (!user) {
        status.textContent = "Connectez-vous pour envoyer votre demande. Vous reviendrez ensuite ici pour terminer l'envoi.";
        window.setTimeout(() => window.location.assign("login.html?returnTo=request-professional.html"), 1200);
        return;
    }
    if (!file) {
        status.textContent = "Sélectionnez votre justificatif avant l'envoi.";
        return;
    }
    if (!allowedTypes.has(file.type) || file.size > maxFileSize) {
        status.textContent = "Le fichier doit être un PDF, JPEG ou PNG de 10 Mo maximum.";
        return;
    }
    submitButton.disabled = true;
    status.textContent = "Envoi de la demande...";
    fileStatus.textContent = "Envoi du justificatif...";
    let step = "upload";
    try {
        const fileRef = ref(getFirebaseStorage(), `professionalRequests/${user.uid}/${file.name}`);
        await new Promise((resolve, reject) => {
            const upload = uploadBytesResumable(fileRef, file, { contentType: file.type });
            upload.on("state_changed", (snapshot) => {
                const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                fileStatus.textContent = `Envoi du justificatif : ${percent} %`;
            }, reject, resolve);
        });
        fileStatus.textContent = "Justificatif envoyé. Enregistrement de la demande...";
        const fileUrl = await getDownloadURL(fileRef);
        step = "firestore";
        await setDoc(doc(getFirestoreDb(), "professionalRequests", user.uid), { createdBy: user.uid, email: user.email || form.email.value.trim(), displayName: form.displayName.value.trim(), description: form.description.value.trim(), verificationFile: { name: file.name, contentType: file.type, size: file.size, url: fileUrl }, status: "pending", createdAt: serverTimestamp() });
        form.reset();
        form.email.value = user.email || "";
        fileStatus.textContent = "Document prêt. Vous pouvez envoyer une nouvelle demande.";
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