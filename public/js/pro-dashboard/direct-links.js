import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.directLinks;

export async function initializeDirectLinks({ user }) {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `<section class="glass working-hours-dialog direct-links-dialog" aria-labelledby="direct-links-title"><div class="working-hours-header"><h2 id="direct-links-title">${strings.title}</h2><button class="btn btn-ghost" type="button" data-direct-links-close>${strings.close}</button></div><p class="admin-panel-help">${strings.help}</p><div data-direct-links-content><p class="working-hours-feedback">${strings.loading}</p></div></section>`;
    document.body.append(modal);
    modal.querySelector("[data-direct-links-close]").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", user.uid));
        const services = snapshot.data()?.services || [];
        const base = `${window.location.origin}/profile.html?pro=${encodeURIComponent(user.uid)}`;
        const links = [{ label: strings.general, url: base }, ...services.map((service, index) => ({ label: service.name, url: `${base}&service=${index}` }))];
        const content = modal.querySelector("[data-direct-links-content]");
        content.innerHTML = links.map((link, index) => `<article class="direct-link-row"><div><strong>${escapeHtml(link.label)}</strong><input readonly value="${escapeHtml(link.url)}" data-direct-url="${index}"></div><div class="direct-link-actions"><button class="btn btn-ghost" type="button" data-copy-direct="${index}">${strings.copy}</button><button class="btn btn-ghost" type="button" data-show-qr="${index}">${strings.qr}</button></div><div class="direct-qr" data-qr="${index}" hidden></div></article>`).join("");
        content.querySelectorAll("[data-copy-direct]").forEach((button) => button.addEventListener("click", async () => { await navigator.clipboard?.writeText(links[Number(button.dataset.copyDirect)].url); button.textContent = strings.copied; window.setTimeout(() => { button.textContent = strings.copy; }, 1600); }));
        content.querySelectorAll("[data-show-qr]").forEach((button) => button.addEventListener("click", () => { const index = Number(button.dataset.showQr); const qr = content.querySelector(`[data-qr="${index}"]`); qr.hidden = !qr.hidden; if (!qr.hidden) qr.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(links[index].url)}" alt="${strings.qrAlt}">`; }));
    } catch {
        modal.querySelector("[data-direct-links-content]").innerHTML = `<p class="working-hours-feedback">${strings.error}</p>`;
    }
    return modal;
}

function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character])); }
