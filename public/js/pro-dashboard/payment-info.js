import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { normalizeCustomPaymentLinks } from "../core/payment-links.js";
import { attachModalBehavior } from "../shared/modal-behavior.js?v=modal-a11y-20260924";

const strings = UI_STRINGS.proDashboard.paymentInfo;
const defaultInfo = {
    enabled: false,
    rib: "",
    bankTransfer: false,
    wero: false,
    weroPhone: "",
    ratePerUnit: "",
    banks: [],
    customPaymentLinks: [],
    customBankName: "",
    customBankUrl: ""
};

export async function initializePaymentInfo({ user }) {
    const modal = createModal();
    const form = modal.querySelector("form");
    const feedback = modal.querySelector("[data-payment-feedback]");

    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", user.uid));
        populateForm(form, { ...defaultInfo, ...(snapshot.data()?.paymentInfo || {}) });
    } catch {
        feedback.textContent = strings.loadError;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const paymentInfo = readForm(form);
        try {
            await setDoc(doc(getFirestoreDb(), "proProfiles", user.uid), {
                owners: [user.uid],
                paymentInfo
            }, { merge: true });
            feedback.textContent = strings.saved;
        } catch {
            feedback.textContent = strings.saveError;
        }
    });

    modal.querySelector("[data-payment-close]").addEventListener("click", () => modal.remove());
    modal.querySelector("[data-payment-link-add]").addEventListener("click", () => addPaymentLinkRow(modal.querySelector("[data-payment-links]")));
    modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.remove();
    });
}

function createModal() {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <form class="glass working-hours-dialog payment-info-dialog" aria-labelledby="payment-info-title">
            <div class="working-hours-header">
                <h2 id="payment-info-title">${strings.title}</h2>
                <button class="icon-button modal-close" type="button" data-payment-close aria-label="${strings.close}" title="${strings.close}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg></button>
            </div>
            <section class="working-hours-section">
                <label class="personal-info-checkbox"><input type="checkbox" name="enabled">${strings.enabledLabel}</label>
                <div class="working-hours-fields">
                    <label class="working-hours-field"><span>${strings.ribLabel}</span><textarea name="rib" rows="3"></textarea></label>
                    <label class="personal-info-checkbox"><input type="checkbox" name="bankTransfer">${strings.bankTransferLabel}</label>
                    <label class="working-hours-field"><span>${strings.rateLabel}</span><input name="ratePerUnit" type="number" min="0" step="0.01"></label>
                </div>
            </section>
            <section class="working-hours-section">
                <h3>${strings.banksTitle}</h3>
                <div class="working-hours-fields payment-bank-list">
                    ${bankToggle("creditAgricole", strings.bankCreditAgricole)}
                    ${bankToggle("creditMutuel", strings.bankCreditMutuel)}
                    ${bankToggle("bnp", strings.bankBnp)}
                    ${bankToggle("societeGenerale", strings.bankSocieteGenerale)}
                </div>
                <h3>${strings.customBankTitle}</h3>
                <div class="payment-links-list" data-payment-links></div>
                <button class="btn btn-ghost" type="button" data-payment-link-add>${strings.addCustomLink}</button>
            </section>
            <section class="working-hours-section">
                <div class="working-hours-fields">
                    <label class="personal-info-checkbox"><input type="checkbox" name="wero">${strings.weroLabel}</label>
                    <label class="working-hours-field"><span>${strings.weroPhoneLabel}</span><input name="weroPhone" type="tel"></label>
                </div>
            </section>
            <div class="working-hours-actions">
                <span class="working-hours-feedback" data-payment-feedback role="status" aria-live="polite"></span>
                <button class="btn btn-solid" type="submit">${strings.save}</button>
            </div>
        </form>
    `;
    document.body.append(modal);
    attachModalBehavior(modal);
    return modal;
}

function bankToggle(name, label) {
    return `<label class="personal-info-checkbox"><input type="checkbox" name="bank-${name}">${label}</label>`;
}

function populateForm(form, info) {
    form.enabled.checked = Boolean(info.enabled);
    form.rib.value = info.rib;
    form.bankTransfer.checked = Boolean(info.bankTransfer);
    form.wero.checked = Boolean(info.wero);
    form.weroPhone.value = info.weroPhone;
    form.ratePerUnit.value = info.ratePerUnit;
    const linkList = form.querySelector("[data-payment-links]");
    linkList.innerHTML = "";
    normalizeCustomPaymentLinks(info).forEach((link) => addPaymentLinkRow(linkList, link));
    (info.banks || []).forEach((bank) => {
        const input = form.querySelector(`[name='bank-${bank}']`);
        if (input) input.checked = true;
    });
}

function readForm(form) {
    return {
        enabled: form.enabled.checked,
        rib: form.rib.value.trim(),
        bankTransfer: form.bankTransfer.checked,
        wero: form.wero.checked,
        weroPhone: form.weroPhone.value.trim(),
        ratePerUnit: form.ratePerUnit.value,
        banks: [...form.querySelectorAll("[name^='bank-']:checked")].map((input) => input.name.slice(5)),
        customPaymentLinks: [...form.querySelectorAll("[data-payment-link]")].map((row) => ({
            label: row.querySelector("[data-payment-link-label]").value.trim(),
            url: row.querySelector("[data-payment-link-url]").value.trim()
        })).filter((link) => link.label || link.url),
        customBankName: "",
        customBankUrl: ""
    };
}

function addPaymentLinkRow(container, link = {}) {
    const row = document.createElement("div");
    row.className = "working-hours-fields payment-link-row";
    row.dataset.paymentLink = "true";
    row.innerHTML = `<label class="working-hours-field"><span>${strings.customBankNameLabel}</span><input data-payment-link-label type="text" value="${escapeAttribute(link.label || "")}"></label><label class="working-hours-field"><span>${strings.customBankUrlLabel}</span><input data-payment-link-url type="url" value="${escapeAttribute(link.url || "")}"></label><button class="btn btn-ghost" type="button" data-payment-link-remove>${strings.removeCustomLink}</button>`;
    row.querySelector("[data-payment-link-remove]").addEventListener("click", () => row.remove());
    container.append(row);
}

function escapeAttribute(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}