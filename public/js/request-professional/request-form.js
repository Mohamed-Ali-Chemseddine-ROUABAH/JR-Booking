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
