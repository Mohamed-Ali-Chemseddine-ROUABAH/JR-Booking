import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { watchAuthState } from "../core/auth-guard.js";
import { getFirebaseFunctions, getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.publicProfile;
const profileId = new URLSearchParams(window.location.search).get("pro");
const status = document.querySelector("[data-profile-status]");
const content = document.querySelector("[data-profile-content]");
const form = document.querySelector("[data-profile-form]");
const authPrompt = document.querySelector("[data-profile-auth-prompt]");
let profile;
let busySlots = [];
let currentUser = null;

initializePage();

async function initializePage() {
    document.title = strings.pageTitle;
    document.querySelector("[data-profile-back]").textContent = strings.backHome;
    status.textContent = strings.loading;
    if (!profileId) {
        status.textContent = strings.unavailable;
        return;
    }

    try {
        const database = getFirestoreDb();
        const profileSnapshot = await getDoc(doc(database, "publicProfiles", profileId));
        if (!profileSnapshot.exists()) {
            status.textContent = strings.unavailable;
            return;
        }
        profile = { id: profileSnapshot.id, ...profileSnapshot.data() };
        const slotsSnapshot = await getDocs(collection(database, "busySlots", profileId, "slots"));
        busySlots = slotsSnapshot.docs.map((slot) => slot.data());
        renderProfile();
        watchAuthState((user) => {
            currentUser = user;
            form.hidden = !user;
            authPrompt.hidden = Boolean(user);
        });
    } catch {
        status.textContent = strings.unavailable;
    }
}

function renderProfile() {
    const visible = profile.visibleFields || {};
    const name = profile.displayName || profile.name || strings.noName;
    document.querySelector("[data-profile-name]").textContent = name;
    document.querySelector("[data-profile-id]").textContent = profile.idTag ? `#${profile.idTag}` : "";
    document.querySelector("[data-profile-description]").textContent = visible.description === false ? "" : (profile.shortDescription || "");
    document.querySelector("[data-profile-schedule-title]").textContent = strings.scheduleTitle;
    document.querySelector("[data-profile-schedule-help]").textContent = strings.scheduleHelp;
    document.querySelector("[data-profile-request-title]").textContent = strings.requestTitle;
    document.querySelector("[data-profile-service-label]").textContent = strings.serviceLabel;
    renderIntakeQuestions();
    document.querySelector("[data-profile-date-label]").textContent = strings.dateLabel;
    document.querySelector("[data-profile-start-label]").textContent = strings.startLabel;
    document.querySelector("[data-profile-end-label]").textContent = strings.endLabel;
    document.querySelector("[data-profile-request]").textContent = strings.request;
    document.querySelector("[data-profile-waitlist]").textContent = strings.waitlist;
    const services = document.querySelector("[data-profile-services]");
    services.replaceChildren(new Option(strings.noService, ""), ...(profile.services || []).map((service, index) => new Option(`${service.name} · ${service.durationMinutes || service.duration} min · ${Number(service.price).toFixed(2)} €`, String(index))));
    document.querySelector("[data-profile-login-required]").textContent = strings.loginRequired;
    document.querySelector("[data-profile-sign-in]").textContent = strings.signIn;
    document.querySelector("[data-profile-register]").textContent = strings.register;

    const categories = document.querySelector("[data-profile-categories]");
    categories.replaceChildren(...(profile.categories || []).map((category) => {
        const element = document.createElement("span");
        element.className = "profile-category";
        element.textContent = category;
        return element;
    }));
    renderDetails(visible);
    renderSchedule();
    content.hidden = false;
    status.textContent = "";
    const dateInput = form.elements.date;
    dateInput.min = toIsoDate(new Date());
    dateInput.value = toIsoDate(new Date(Date.now() + 86400000));
}

function renderIntakeQuestions() {
    const section = document.querySelector("[data-profile-intake]");
    const questions = profile.intakeQuestionnaire?.questions || [];
    section.hidden = !questions.length;
    section.querySelector("[data-profile-intake-title]").textContent = strings.intakeTitle;
    const list = section.querySelector("[data-profile-intake-list]");
    list.replaceChildren(...questions.map((question, index) => {
        const label = document.createElement("label");
        label.textContent = question.text;
        const input = document.createElement("textarea");
        input.name = `intake_${index}`;
        input.required = question.required !== false;
        label.append(input);
        return label;
    }));
}

function renderDetails(visible) {
    const details = document.querySelector("[data-profile-details]");
    details.replaceChildren();
    const fields = ["country", "phone", "address", "student", "siret"];
    fields.forEach((field) => {
        if (visible[field] !== true || !profile[field]) return;
        const line = document.createElement("span");
        line.textContent = field === "student" ? "Étudiant" : profile[field];
        details.append(line);
    });
    (profile.links || []).forEach((link) => {
        if (!link.url) return;
        const anchor = document.createElement("a");
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.rel = "noreferrer";
        anchor.textContent = link.label || link.url;
        details.append(anchor);
    });
}

function renderSchedule() {
    const schedule = document.querySelector("[data-profile-schedule]");
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + index);
        return date;
    });
    const header = document.createElement("div");
    header.className = "profile-schedule-header";
    header.append(document.createElement("span"));
    days.forEach((date) => {
        const heading = document.createElement("strong");
        heading.textContent = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" }).format(date);
        header.append(heading);
    });
    const grid = document.createElement("div");
    grid.className = "profile-schedule-grid";
    for (let hour = 9; hour < 17; hour += 1) {
        const start = `${String(hour).padStart(2, "0")}:00`;
        const end = `${String(hour + 1).padStart(2, "0")}:00`;
        const time = document.createElement("span");
        time.className = "profile-time-label";
        time.textContent = start;
        grid.append(time);
        days.forEach((date) => {
            const slot = document.createElement("button");
            slot.type = "button";
            slot.className = "profile-slot";
            slot.textContent = isBusy(toIsoDate(date), start, end) ? strings.occupiedSlot : strings.emptySlot;
            slot.dataset.date = toIsoDate(date);
            slot.dataset.start = start;
            slot.dataset.end = end;
            if (isBusy(slot.dataset.date, start, end)) {
                slot.classList.add("is-busy");
                slot.title = strings.occupied;
            }
            slot.addEventListener("click", () => selectSlot(slot));
            grid.append(slot);
        });
    }
    schedule.replaceChildren(header, grid);
}

function selectSlot(slot) {
    form.elements.date.value = slot.dataset.date;
    form.elements.start.value = slot.dataset.start;
    form.elements.end.value = slot.dataset.end;
    form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    form.querySelector("[data-profile-waitlist]").hidden = !slot.classList.contains("is-busy");
}

function isBusy(date, start, end) {
    return busySlots.some((slot) => {
        const busyStart = toDate(slot.start);
        const busyEnd = toDate(slot.end);
        return busyStart && busyEnd && toIsoDate(busyStart) === date && start < timeValue(busyEnd) && end > timeValue(busyStart);
    });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const selectedService = profile.services?.[Number(formData.get("serviceId"))];
    const intakeAnswers = Object.fromEntries([...form.elements].filter((element) => element.name.startsWith("intake_")).map((element) => [element.name, element.value.trim()]));
    const date = formData.get("date");
    const start = `${date}T${formData.get("start")}`;
    const end = `${date}T${formData.get("end")}`;
    const feedback = document.querySelector("[data-profile-feedback]");
    if (new Date(end) <= new Date(start)) {
        feedback.textContent = strings.invalidRange;
        return;
    }
    if (!currentUser) {
        authPrompt.hidden = false;
        form.hidden = true;
        return;
    }
    if (isBusy(date, formData.get("start"), formData.get("end"))) {
        feedback.textContent = strings.occupied;
        return;
    }
    try {
        const clientSnapshot = await getDoc(doc(getFirestoreDb(), "clientAccounts", currentUser.uid));
        await addDoc(collection(getFirestoreDb(), "bookings"), {
            proId: profileId,
            clientId: currentUser.uid,
            clientAddress: clientSnapshot.data()?.address || "",
            start,
            end,
            status: "pending",
            createdBy: currentUser.uid,
            createdAt: serverTimestamp(),
            ...(selectedService ? { service: { name: selectedService.name, durationMinutes: selectedService.durationMinutes || selectedService.duration, price: selectedService.price } } : {}),
                ...(Object.keys(intakeAnswers).length ? { intakeAnswers } : {})
        });
        feedback.textContent = strings.saved;
        form.reset();
    } catch {
        feedback.textContent = strings.error;
    }
});

form.querySelector("[data-profile-waitlist]").addEventListener("click", async () => {
    if (!currentUser) { authPrompt.hidden = false; form.hidden = true; return; }
    const feedback = document.querySelector("[data-profile-feedback]");
    try {
        await httpsCallable(getFirebaseFunctions(), "joinBookingWaitlist")({ proId: profileId, start: `${form.elements.date.value}T${form.elements.start.value}`, end: `${form.elements.date.value}T${form.elements.end.value}` });
        feedback.textContent = strings.waitlistSaved;
    } catch { feedback.textContent = strings.waitlistError; }
});

function toDate(value) {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function timeValue(date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
