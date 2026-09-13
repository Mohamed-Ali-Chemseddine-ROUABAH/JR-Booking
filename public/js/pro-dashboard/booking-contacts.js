import { UI_STRINGS } from "../core/strings-fr.js";

const strings = UI_STRINGS.proDashboard.bookingCreation;
const additionalRoles = ["guardian", "payer", "participant", "assistant"];

export function initializeBookingContactEditor(container, initialContacts = [], { onInvite } = {}) {
    const contacts = initialContacts.length
        ? initialContacts.map((contact) => ({ ...contact }))
        : [{ name: "", email: "", role: "primary", notify: true }];
    if (!contacts.some((contact) => contact.role === "primary")) contacts.unshift({ name: "", email: "", role: "primary", notify: true });

    const heading = document.createElement("div");
    heading.className = "booking-contacts-heading";
    const title = document.createElement("h3");
    title.textContent = strings.contactsTitle;
    const addButton = document.createElement("button");
    addButton.className = "btn btn-ghost";
    addButton.type = "button";
    addButton.textContent = strings.addContact;
    heading.append(title, addButton);

    const list = document.createElement("div");
    list.className = "booking-contact-list";
    container.replaceChildren(heading, list);

    const readRenderedContacts = () => [...list.querySelectorAll("[data-booking-contact]")].map((row) => ({
        contactId: row.dataset.contactId || null,
        name: row.querySelector("[data-contact-name]").value,
        email: row.querySelector("[data-contact-email]").value,
        role: row.querySelector("[data-contact-role]").value,
        notify: row.querySelector("[data-contact-notify]").checked
    }));
    const syncContacts = () => contacts.splice(0, contacts.length, ...readRenderedContacts());
    const render = () => {
        list.replaceChildren(...contacts.map((contact, index) => createContactRow(contact, index, () => {
            syncContacts();
            contacts.splice(index, 1);
            render();
        }, onInvite)));
        addButton.disabled = contacts.length >= 10;
    };

    addButton.addEventListener("click", () => {
        if (contacts.length >= 10) return;
        syncContacts();
        contacts.push({ name: "", email: "", role: "participant", notify: true });
        render();
    });
    render();

    return {
        getContacts() {
            return readRenderedContacts();
        }
    };
}

function createContactRow(contact, index, onRemove, onInvite) {
    const isPrimary = contact.role === "primary";
    const row = document.createElement("div");
    row.className = "booking-contact-row";
    row.dataset.bookingContact = "";
    row.dataset.contactId = contact.contactId || "";

    const nameField = createInputField(strings.clientNameLabel, "text", contact.name, "contactName");
    const emailField = createInputField(strings.clientEmailLabel, "email", contact.email, "contactEmail");
    const roleField = document.createElement("label");
    roleField.className = "working-hours-field";
    const roleLabel = document.createElement("span");
    roleLabel.textContent = strings.contactRoleLabel;
    const roleSelect = document.createElement("select");
    roleSelect.dataset.contactRole = "";
    const roles = isPrimary ? ["primary"] : additionalRoles;
    roles.forEach((role) => {
        const option = document.createElement("option");
        option.value = role;
        option.textContent = strings.contactRoles[role];
        option.selected = role === contact.role;
        roleSelect.append(option);
    });
    roleField.append(roleLabel, roleSelect);

    const actions = document.createElement("div");
    actions.className = "booking-contact-actions";
    const notifyLabel = document.createElement("label");
    notifyLabel.className = "booking-contact-notify";
    const notifyInput = document.createElement("input");
    notifyInput.type = "checkbox";
    notifyInput.checked = contact.notify !== false;
    notifyInput.dataset.contactNotify = "";
    notifyLabel.append(notifyInput, document.createTextNode(strings.notifyContact));
    actions.append(notifyLabel);
    if (contact.contactId && onInvite) {
        const inviteButton = document.createElement("button");
        inviteButton.className = "btn btn-ghost";
        inviteButton.type = "button";
        inviteButton.textContent = strings.sendClaimInvitation;
        inviteButton.addEventListener("click", async () => {
            inviteButton.disabled = true;
            try {
                await onInvite(contact);
            } finally {
                inviteButton.disabled = false;
            }
        });
        actions.append(inviteButton);
    }
    if (!isPrimary) {
        const removeButton = document.createElement("button");
        removeButton.className = "btn btn-ghost";
        removeButton.type = "button";
        removeButton.textContent = strings.removeContact;
        removeButton.addEventListener("click", () => {
            if (globalThis.confirm(strings.confirmRemoveContact)) onRemove();
        });
        actions.append(removeButton);
    }

    const position = document.createElement("strong");
    position.className = "booking-contact-position";
    position.textContent = isPrimary ? strings.primaryContact : `${strings.additionalContact} ${index}`;
    row.append(position, nameField, emailField, roleField, actions);
    return row;
}

function createInputField(labelText, type, value, dataName) {
    const label = document.createElement("label");
    label.className = "working-hours-field";
    const text = document.createElement("span");
    text.textContent = labelText;
    const input = document.createElement("input");
    input.type = type;
    input.value = value || "";
    input.required = true;
    input.dataset[dataName] = "";
    label.append(text, input);
    return label;
}