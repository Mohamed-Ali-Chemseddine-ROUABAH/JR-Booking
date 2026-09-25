import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { attachModalBehavior } from "../shared/modal-behavior.js?v=modal-a11y-20260924";

const strings = UI_STRINGS.proDashboard.personalInfo;
const defaultColors = { accentColor: "#8ab4ff", headerColor: "#0c0e11", textColor: "#f4f5f7" };
const defaultInfo = {
    fullName: "",
    idTag: "",
    country: "",
    phone: "",
    address: "",
    student: false,
    description: "",
    siret: "",
    ...defaultColors,
    links: [],
    experience: [],
    categories: [],
    visibleFields: { fullName: true, country: false, phone: false, address: false, student: false, description: true, siret: false }
};

export async function initializePersonalInfo({ user }) {
    const modal = createModal();
    const form = modal.querySelector("form");
    const feedback = modal.querySelector("[data-personal-info-feedback]");

    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", user.uid));
        populateForm(modal, normalizeInfo(snapshot.exists() ? snapshot.data().personalInfo : defaultInfo));
    } catch {
        feedback.textContent = strings.loadError;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        feedback.textContent = "";
        const personalInfo = readForm(modal);

        try {
            await setDoc(doc(getFirestoreDb(), "proProfiles", user.uid), {
                owners: [user.uid],
                personalInfo
            }, { merge: true });
            await setDoc(doc(getFirestoreDb(), "publicProfiles", user.uid), {
                owners: [user.uid],
                displayName: personalInfo.fullName,
                name: personalInfo.visibleFields.fullName ? personalInfo.fullName : "",
                idTag: personalInfo.idTag,
                categories: personalInfo.categories,
                shortDescription: personalInfo.visibleFields.description ? personalInfo.description : "",
                visibleFields: personalInfo.visibleFields,
                updatedAt: serverTimestamp()
            }, { merge: true });
            feedback.textContent = strings.saved;
        } catch {
            feedback.textContent = strings.saveError;
        }
    });

    modal.querySelector("[data-personal-info-close]").addEventListener("click", () => modal.remove());
    modal.querySelector("[data-add-link]").addEventListener("click", () => addLinkRow(modal.querySelector("[data-links]")));
    modal.querySelector("[data-add-experience]").addEventListener("click", () => addExperienceRow(modal.querySelector("[data-experience]")));
    modal.querySelector("[data-add-category]").addEventListener("click", () => addCategory(modal, modal.querySelector("[data-new-category]").value.trim()));
    modal.addEventListener("click", (event) => {
        if (event.target.matches("[data-remove-row]")) {
            event.target.closest(".working-hours-repeatable-row").remove();
        }
        if (event.target.matches("[data-remove-category]")) {
            event.target.closest("[data-category-chip]").remove();
        }
        if (event.target.matches("[data-reset-color]")) {
            const field = event.target.dataset.resetColor;
            modal.querySelector(`[name='${field}']`).value = defaultColors[field];
        }
        if (event.target === modal) {
            modal.remove();
        }
    });
}

function createModal() {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <form class="glass working-hours-dialog personal-info-dialog" aria-labelledby="personal-info-title">
            <div class="working-hours-header">
                <h2 id="personal-info-title">${strings.title}</h2>
                <button class="icon-button modal-close" type="button" data-personal-info-close aria-label="${strings.close}" title="${strings.close}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg></button>
            </div>
            <section class="working-hours-section">
                <h3>${strings.identitySection}</h3>
                <div class="working-hours-fields">
                    ${textField("fullName", strings.fullNameLabel, true)}
                    <label class="working-hours-field"><span>${strings.idTagLabel}</span><input name="idTag" type="text" required><small>${strings.idTagHelp}</small></label>
                    ${textField("country", strings.countryLabel, false)}
                    ${textField("phone", strings.phoneLabel, false, "tel")}
                    ${textField("address", strings.addressLabel, false)}
                    ${textField("siret", strings.siretLabel, false)}
                </div>
                <label class="personal-info-checkbox"><input type="checkbox" name="student">${strings.studentLabel}</label>
                <label class="working-hours-field"><span>${strings.descriptionLabel}</span><textarea name="description" rows="3"></textarea></label>
                <div class="personal-info-visibility">
                    ${["fullName", "country", "phone", "address", "student", "description", "siret"].map((field) => visibilityToggle(field)).join("")}
                </div>
            </section>
            <section class="working-hours-section">
                <h3>${strings.appearanceSection}</h3>
                <div class="working-hours-fields">
                    ${colorField("accentColor", strings.accentColorLabel)}
                    ${colorField("headerColor", strings.headerColorLabel)}
                    ${colorField("textColor", strings.textColorLabel)}
                </div>
            </section>
            <section class="working-hours-section">
                <h3>${strings.categoriesSection}</h3>
                <p class="working-hours-feedback">${strings.categoriesHelp}</p>
                <div class="personal-info-categories" data-categories></div>
                <div class="personal-info-category-add">
                    <input type="text" data-new-category placeholder="${strings.newCategoryPlaceholder}">
                    <button class="btn btn-ghost" type="button" data-add-category>${strings.addCategory}</button>
                </div>
            </section>
            <section class="working-hours-section">
                <h3>${strings.linksSection}</h3>
                <div class="working-hours-repeatable-list" data-links></div>
                <button class="btn btn-ghost working-hours-add" type="button" data-add-link>${strings.addLink}</button>
            </section>
            <section class="working-hours-section">
                <h3>${strings.experienceSection}</h3>
                <div class="working-hours-repeatable-list" data-experience></div>
                <button class="btn btn-ghost working-hours-add" type="button" data-add-experience>${strings.addExperience}</button>
            </section>
            <div class="working-hours-actions">
                <span class="working-hours-feedback" data-personal-info-feedback role="status" aria-live="polite"></span>
                <button class="btn btn-solid" type="submit">${strings.save}</button>
            </div>
        </form>
    `;
    document.body.append(modal);
    attachModalBehavior(modal);
    return modal;
}

function textField(name, label, required, type = "text") {
    return `<label class="working-hours-field"><span>${label}</span><input name="${name}" type="${type}"${required ? " required" : ""}></label>`;
}

function colorField(name, label) {
    return `<label class="working-hours-field"><span>${label}</span><div class="personal-info-color-row"><input name="${name}" type="color"><button class="btn btn-ghost" type="button" data-reset-color="${name}">${strings.resetColor}</button></div></label>`;
}

function visibilityToggle(field) {
    return `<label class="personal-info-checkbox"><input type="checkbox" name="visible-${field}">${strings.visible} — ${strings[`${field}Label`] || field}</label>`;
}

function populateForm(modal, info) {
    const form = modal.querySelector("form");
    form.fullName.value = info.fullName;
    form.idTag.value = info.idTag;
    form.country.value = info.country;
    form.phone.value = info.phone;
    form.address.value = info.address;
    form.siret.value = info.siret;
    form.student.checked = Boolean(info.student);
    form.description.value = info.description;
    form.accentColor.value = info.accentColor;
    form.headerColor.value = info.headerColor;
    form.textColor.value = info.textColor;
    Object.entries(info.visibleFields).forEach(([field, visible]) => {
        const input = form.querySelector(`[name='visible-${field}']`);
        if (input) {
            input.checked = Boolean(visible);
        }
    });
    info.categories.forEach((category) => addCategory(modal, category));
    info.links.forEach((link) => addLinkRow(modal.querySelector("[data-links]"), link));
    info.experience.forEach((entry) => addExperienceRow(modal.querySelector("[data-experience]"), entry));
}

function readForm(modal) {
    const form = modal.querySelector("form");
    const visibleFields = {};
    ["fullName", "country", "phone", "address", "student", "description", "siret"].forEach((field) => {
        visibleFields[field] = form.querySelector(`[name='visible-${field}']`).checked;
    });

    return {
        fullName: form.fullName.value.trim(),
        idTag: form.idTag.value.trim(),
        country: form.country.value.trim(),
        phone: form.phone.value.trim(),
        address: form.address.value.trim(),
        student: form.student.checked,
        description: form.description.value.trim(),
        siret: form.siret.value.trim(),
        accentColor: form.accentColor.value,
        headerColor: form.headerColor.value,
        textColor: form.textColor.value,
        visibleFields,
        categories: [...modal.querySelectorAll("[data-category-chip]")].map((chip) => chip.dataset.categoryChip),
        links: [...modal.querySelectorAll("[data-link-row]")].map((row) => ({
            label: row.querySelector("[name='linkLabel']").value.trim(),
            url: row.querySelector("[name='linkUrl']").value.trim()
        })).filter((link) => link.label || link.url),
        experience: [...modal.querySelectorAll("[data-experience-row]")].map((row) => ({
            name: row.querySelector("[name='experienceName']").value.trim(),
            year: row.querySelector("[name='experienceYear']").value.trim()
        })).filter((entry) => entry.name || entry.year)
    };
}

function normalizeInfo(info = {}) {
    return {
        ...defaultInfo,
        ...info,
        visibleFields: { ...defaultInfo.visibleFields, ...(info.visibleFields || {}) },
        links: Array.isArray(info.links) ? info.links : [],
        experience: Array.isArray(info.experience) ? info.experience : [],
        categories: Array.isArray(info.categories) ? info.categories : []
    };
}

function addCategory(modal, category) {
    if (!category) {
        return;
    }
    const list = modal.querySelector("[data-categories]");
    if (list.children.length >= 10) {
        modal.querySelector("[data-personal-info-feedback]").textContent = strings.categoriesLimitReached;
        return;
    }
    if ([...list.children].some((chip) => chip.dataset.categoryChip.toLowerCase() === category.toLowerCase())) {
        return;
    }
    const chip = document.createElement("span");
    chip.className = "personal-info-chip";
    chip.dataset.categoryChip = category;
    chip.innerHTML = `${category}<button type="button" data-remove-category aria-label="${strings.removeCategory}">×</button>`;
    list.append(chip);
    const newCategoryInput = modal.querySelector("[data-new-category]");
    if (newCategoryInput) {
        newCategoryInput.value = "";
    }
}

function addLinkRow(container, link = {}) {
    const row = document.createElement("div");
    row.className = "working-hours-repeatable-row";
    row.dataset.linkRow = "true";
    row.innerHTML = `${textField("linkLabel", strings.linkLabelLabel, false)}${textField("linkUrl", strings.linkUrlLabel, false, "url")}<button class="btn btn-ghost" type="button" data-remove-row>${strings.removeLink}</button>`;
    row.querySelector("[name='linkLabel']").value = link.label || "";
    row.querySelector("[name='linkUrl']").value = link.url || "";
    container.append(row);
}

function addExperienceRow(container, entry = {}) {
    const row = document.createElement("div");
    row.className = "working-hours-repeatable-row";
    row.dataset.experienceRow = "true";
    row.innerHTML = `${textField("experienceName", strings.experienceNameLabel, false)}${textField("experienceYear", strings.experienceYearLabel, false, "number")}<button class="btn btn-ghost" type="button" data-remove-row>${strings.removeExperience}</button>`;
    row.querySelector("[name='experienceName']").value = entry.name || "";
    row.querySelector("[name='experienceYear']").value = entry.year || "";
    container.append(row);
}
