import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestoreDb } from "../core/firebase-init.js";
import { UI_STRINGS } from "../core/strings-fr.js";
import { attachModalBehavior } from "../shared/modal-behavior.js?v=modal-a11y-20260924";

const strings = UI_STRINGS.proDashboard.movementInfo;
const defaultInfo = {
    online: true,
    movement: false,
    address: "",
    addressVisible: false,
    transportation: "car",
    transportationVisible: false,
    zones: []
};

export async function initializeMovementInfo({ user }) {
    const modal = createModal();
    const form = modal.querySelector("form");
    const feedback = modal.querySelector("[data-movement-feedback]");
    let map;

    try {
        const snapshot = await getDoc(doc(getFirestoreDb(), "proProfiles", user.uid));
        const info = { ...defaultInfo, ...(snapshot.data()?.movementInfo || {}) };
        populateForm(form, info);
        info.zones.forEach((zone) => addZoneRow(modal.querySelector("[data-zones]"), zone));
        map = createMap(modal.querySelector("[data-movement-map]"), feedback);
    } catch {
        feedback.textContent = strings.loadError;
    }

    modal.querySelector("[data-add-zone]").addEventListener("click", () => addZoneRow(modal.querySelector("[data-zones]")));
    modal.querySelector("[data-locate]").addEventListener("click", () => locateAddress(form, map, feedback));
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const movementInfo = readForm(modal);
        try {
            await setDoc(doc(getFirestoreDb(), "proProfiles", user.uid), {
                owners: [user.uid],
                movementInfo
            }, { merge: true });
            feedback.textContent = strings.saved;
        } catch {
            feedback.textContent = strings.saveError;
        }
    });

    modal.addEventListener("click", (event) => {
        if (event.target.matches("[data-remove-zone]")) event.target.closest("[data-zone]").remove();
        if (event.target === modal) modal.remove();
    });
    modal.querySelector("[data-movement-close]").addEventListener("click", () => modal.remove());
}

function createModal() {
    const modal = document.createElement("div");
    modal.className = "working-hours-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
        <form class="glass working-hours-dialog movement-info-dialog" aria-labelledby="movement-info-title">
            <div class="working-hours-header">
                <h2 id="movement-info-title">${strings.title}</h2>
                <button class="icon-button modal-close" type="button" data-movement-close aria-label="${strings.close}" title="${strings.close}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg></button>
            </div>
            <section class="working-hours-section">
                <div class="working-hours-fields">
                    <label class="personal-info-checkbox"><input type="checkbox" name="online">${strings.onlineLabel}</label>
                    <label class="personal-info-checkbox"><input type="checkbox" name="movement">${strings.movementLabel}</label>
                    <label class="working-hours-field"><span>${strings.addressLabel}</span><input name="address" type="text"><small>${strings.addressHelp}</small></label>
                    <label class="personal-info-checkbox"><input type="checkbox" name="addressVisible">${strings.addressVisibleLabel}</label>
                </div>
            </section>
            <section class="working-hours-section">
                <h3>${strings.mapTitle}</h3>
                <div class="movement-map" data-movement-map></div>
                <button class="btn btn-ghost" type="button" data-locate>${strings.locate}</button>
            </section>
            <section class="working-hours-section">
                <div class="working-hours-fields">
                    <label class="working-hours-field"><span>${strings.transportationLabel}</span><select name="transportation"><option value="car">${strings.transportationCar}</option><option value="transit">${strings.transportationTransit}</option><option value="bike">${strings.transportationBike}</option><option value="walk">${strings.transportationWalk}</option></select></label>
                    <label class="personal-info-checkbox"><input type="checkbox" name="transportationVisible">${strings.transportationVisibleLabel}</label>
                </div>
            </section>
            <section class="working-hours-section">
                <h3>${strings.zonesTitle}</h3>
                <p class="working-hours-feedback">${strings.zonesHelp}</p>
                <div class="working-hours-repeatable-list" data-zones></div>
                <button class="btn btn-ghost working-hours-add" type="button" data-add-zone>${strings.addZone}</button>
            </section>
            <div class="working-hours-actions">
                <span class="working-hours-feedback" data-movement-feedback role="status" aria-live="polite"></span>
                <button class="btn btn-solid" type="submit">${strings.save}</button>
            </div>
        </form>
    `;
    document.body.append(modal);
    attachModalBehavior(modal);
    return modal;
}

function addZoneRow(container, zone = {}) {
    const row = document.createElement("div");
    row.className = "working-hours-repeatable-row movement-zone-row";
    row.dataset.zone = "true";
    row.innerHTML = `
        <label class="working-hours-field"><span>${strings.zoneMinLabel}</span><input name="zoneMin" type="number" min="0" step="0.1" value="${zone.min ?? ""}" required></label>
        <label class="working-hours-field"><span>${strings.zoneMaxLabel}</span><input name="zoneMax" type="number" min="0" step="0.1" value="${zone.max ?? ""}" required></label>
        <label class="working-hours-field"><span>${strings.zoneFeeLabel}</span><input name="zoneFee" type="number" min="0" step="0.01" value="${zone.fee ?? ""}" required></label>
        <button class="btn btn-ghost" type="button" data-remove-zone>${strings.removeZone}</button>
    `;
    container.append(row);
}

function populateForm(form, info) {
    form.online.checked = Boolean(info.online);
    form.movement.checked = Boolean(info.movement);
    form.address.value = info.address;
    form.addressVisible.checked = Boolean(info.addressVisible);
    form.transportation.value = info.transportation;
    form.transportationVisible.checked = Boolean(info.transportationVisible);
}

function readForm(modal) {
    const form = modal.querySelector("form");
    return {
        online: form.online.checked,
        movement: form.movement.checked,
        address: form.address.value.trim(),
        addressVisible: form.addressVisible.checked,
        transportation: form.transportation.value,
        transportationVisible: form.transportationVisible.checked,
        zones: [...modal.querySelectorAll("[data-zone]")].map((row) => ({
            min: Number(row.querySelector("[name='zoneMin']").value),
            max: Number(row.querySelector("[name='zoneMax']").value),
            fee: Number(row.querySelector("[name='zoneFee']").value)
        }))
    };
}

function createMap(container, feedback) {
    if (!window.L) {
        feedback.textContent = strings.mapUnavailable;
        return null;
    }
    const map = window.L.map(container).setView([46.6, 2.4], 5);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);
    return map;
}

async function locateAddress(form, map, feedback) {
    if (!form.address.value.trim()) {
        feedback.textContent = strings.addressMissing;
        return;
    }
    if (!map) return;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(form.address.value.trim())}`);
        const results = await response.json();
        if (!results[0]) return;
        const point = [Number(results[0].lat), Number(results[0].lon)];
        map.setView(point, 13);
        window.L.marker(point).addTo(map);
    } catch {
        feedback.textContent = strings.mapUnavailable;
    }
}