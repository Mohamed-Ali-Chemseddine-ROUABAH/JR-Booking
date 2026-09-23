import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
import { watchAuthState } from "../core/auth-guard.js";
import { getFirebaseFunctions, getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { normalizeScheduleSettings } from "../schedule/schedule-settings.mjs";
import { isLocalDateTimeRangeValid, zonedLocalToIso } from "../core/datetime-utils.mjs";

const strings = UI_STRINGS.publicProfile;
const profileId = new URLSearchParams(window.location.search).get("pro");
const requestedService = new URLSearchParams(window.location.search).get("service");
const requestedDate = new URLSearchParams(window.location.search).get("requestedDate");
const requestedStart = new URLSearchParams(window.location.search).get("requestedStart");
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
    if (requestedService !== null && profile.services?.[Number(requestedService)]) services.value = requestedService;
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
    dateInput.min = getZonedParts(new Date(), profile.scheduleAvailability?.timezone || profile.timezone || "Europe/Paris").date;
    dateInput.value = requestedDate || toIsoDate(new Date(Date.now() + 86400000));
    if (requestedStart && /^\d{2}:\d{2}$/.test(requestedStart)) {
        form.elements.start.value = requestedStart;
        form.elements.end.value = addMinutes(requestedStart, 60);
    }
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
    const availability = profile.scheduleAvailability || {};
    const scheduleSettings = normalizeScheduleSettings(availability.scheduleSettings);
    const timezone = availability.timezone || profile.timezone || "Europe/Paris";
    const startHour = Number(String(availability.startTime || "09:00").slice(0, 2));
    const endHour = Number(String(availability.endTime || "17:00").slice(0, 2));
    const workingDays = Array.isArray(availability.workingDays) && availability.workingDays.length ? availability.workingDays : [1, 2, 3, 4, 5];
    let daysToShow = 7;
    let dayOffset = 0;
    schedule.innerHTML = `<div class="profile-schedule-toolbar"><div class="profile-schedule-nav"><button class="icon-button schedule-nav-button" type="button" data-profile-navigation="previous" aria-label="${strings.previous}" title="${strings.previous}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg></button><button class="chip-button" type="button" data-profile-navigation="today">${strings.today}</button><button class="icon-button schedule-nav-button" type="button" data-profile-navigation="next" aria-label="${strings.next}" title="${strings.next}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5 7 7-7 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg></button></div><div class="profile-schedule-views" role="group" aria-label="${strings.scheduleTitle}"><button class="chip-button" type="button" data-profile-days="1">${strings.viewOne}</button><button class="chip-button" type="button" data-profile-days="3">${strings.viewThree}</button><button class="chip-button is-active" type="button" data-profile-days="7">${strings.viewSeven}</button></div></div><div data-profile-schedule-grid></div>`;
    const renderGrid = () => {
        const days = getPublicDays(timezone, dayOffset, daysToShow);
        const header = document.createElement("div");
        header.className = "profile-schedule-header";
        header.style.setProperty("--profile-day-count", String(daysToShow));
        header.append(document.createElement("span"));
        days.forEach((date) => {
            const heading = document.createElement("strong");
            heading.textContent = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(date.value);
            header.append(heading);
        });
        const grid = document.createElement("div");
        grid.className = "profile-schedule-grid";
        grid.style.setProperty("--profile-day-count", String(daysToShow));
        for (let hour = startHour; hour < endHour; hour += 1) {
            const start = `${String(hour).padStart(2, "0")}:00`;
            const end = `${String(hour + 1).padStart(2, "0")}:00`;
            const time = document.createElement("span");
            time.className = "profile-time-label";
            time.textContent = start;
            grid.append(time);
            days.forEach((day) => {
                const slot = document.createElement("button");
                slot.type = "button";
                slot.className = "profile-slot";
                const active = workingDays.includes(day.weekday) && isPublicDateActive(day.isoDate, scheduleSettings);
                slot.textContent = !active ? strings.unavailableSlot : isBusy(day.isoDate, start, end, timezone) ? strings.occupiedSlot : strings.emptySlot;
                slot.dataset.date = day.isoDate;
                slot.dataset.start = start;
                slot.dataset.end = end;
                if (!active) slot.disabled = true;
                if (isBusy(slot.dataset.date, start, end, timezone)) {
                    slot.classList.add("is-busy");
                    slot.title = strings.occupied;
                }
                slot.addEventListener("click", () => selectSlot(slot));
                grid.append(slot);
            });
        }
        schedule.querySelector("[data-profile-schedule-grid]").replaceChildren(header, grid);
    };
    schedule.querySelectorAll("[data-profile-days]").forEach((button) => button.addEventListener("click", () => {
        daysToShow = Number(button.dataset.profileDays);
        dayOffset = 0;
        schedule.querySelectorAll("[data-profile-days]").forEach((item) => item.classList.toggle("is-active", item === button));
        renderGrid();
    }));
    schedule.querySelector("[data-profile-navigation='previous']").addEventListener("click", () => { dayOffset -= daysToShow; renderGrid(); });
    schedule.querySelector("[data-profile-navigation='today']").addEventListener("click", () => { dayOffset = 0; renderGrid(); });
    schedule.querySelector("[data-profile-navigation='next']").addEventListener("click", () => { dayOffset += daysToShow; renderGrid(); });
    renderGrid();
}

function selectSlot(slot) {
    form.elements.date.value = slot.dataset.date;
    form.elements.start.value = slot.dataset.start;
    const selectedService = profile.services?.[Number(form.elements.serviceId.value)];
    const durationMinutes = selectedService?.durationMinutes || selectedService?.duration || 0;
    form.elements.end.value = durationMinutes ? addMinutes(slot.dataset.start, durationMinutes) : slot.dataset.end;
    form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    form.querySelector("[data-profile-waitlist]").hidden = !slot.classList.contains("is-busy");
}

function isPublicDateActive(date, settings) {
    return settings.activationMode === "permanent"
        || (settings.activationMode === "from-date" && (!settings.activationDate || date >= settings.activationDate))
        || (settings.activationMode === "single-day" && date === settings.activationDate);
}

function addMinutes(time, minutes) {
    const [hours, currentMinutes] = time.split(":").map(Number);
    const total = hours * 60 + currentMinutes + Number(minutes);
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function isBusy(date, start, end, timezone) {
    return busySlots.some((slot) => {
        const busyStart = toDate(slot.start);
        const busyEnd = toDate(slot.end);
        const startParts = busyStart ? getZonedParts(busyStart, timezone) : null;
        const endParts = busyEnd ? getZonedParts(busyEnd, timezone) : null;
        return startParts && endParts
            && `${date}T${end}` > `${startParts.date}T${String(startParts.hour).padStart(2, "0")}:${String(startParts.minute).padStart(2, "0")}`
            && `${date}T${start}` < `${endParts.date}T${String(endParts.hour).padStart(2, "0")}:${String(endParts.minute).padStart(2, "0")}`;
    });
}

function getPublicDays(timezone, offset, count) {
    const current = getZonedParts(new Date(), timezone);
    const base = new Date(`${current.date}T12:00:00Z`);
    return Array.from({ length: count }, (_, index) => {
        const value = new Date(base);
        value.setUTCDate(base.getUTCDate() + offset + index);
        const isoDate = value.toISOString().slice(0, 10);
        return { value, isoDate, weekday: value.getUTCDay() || 7 };
    });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const selectedService = profile.services?.[Number(formData.get("serviceId"))];
    const intakeAnswers = Object.fromEntries([...form.elements].filter((element) => element.name.startsWith("intake_")).map((element) => [element.name, element.value.trim()]));
    const date = formData.get("date");
    const localStart = `${date}T${formData.get("start")}`;
    const localEnd = `${date}T${formData.get("end")}`;
    const timezone = profile.scheduleAvailability?.timezone || profile.timezone || "Europe/Paris";
    const feedback = document.querySelector("[data-profile-feedback]");
    if (!isLocalDateTimeRangeValid(localStart, localEnd)) {
        feedback.textContent = strings.invalidRange;
        return;
    }
    if (!currentUser) {
        authPrompt.hidden = false;
        form.hidden = true;
        return;
    }
    if (isBusy(date, formData.get("start"), formData.get("end"), timezone)) {
        feedback.textContent = strings.occupied;
        return;
    }
    try {
        const clientSnapshot = await getDoc(doc(getFirestoreDb(), "clientAccounts", currentUser.uid));
        await addDoc(collection(getFirestoreDb(), "bookings"), {
            proId: profileId,
            clientId: currentUser.uid,
            clientAddress: clientSnapshot.data()?.address || "",
            start: zonedLocalToIso(localStart, timezone),
            end: zonedLocalToIso(localEnd, timezone),
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
        const timezone = profile.scheduleAvailability?.timezone || profile.timezone || "Europe/Paris";
        await httpsCallable(getFirebaseFunctions(), "joinBookingWaitlist")({ proId: profileId, start: zonedLocalToIso(`${form.elements.date.value}T${form.elements.start.value}`, timezone), end: zonedLocalToIso(`${form.elements.date.value}T${form.elements.end.value}`, timezone) });
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

function getZonedParts(value, timezone) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(value);
    const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
    return { date: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour), minute: Number(values.minute) };
}
