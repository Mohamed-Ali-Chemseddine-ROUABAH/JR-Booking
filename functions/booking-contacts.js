const CONTACT_ROLES = new Set(["primary", "guardian", "payer", "participant", "assistant"]);
const MAX_BOOKING_CONTACTS = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class BookingContactValidationError extends Error {
    constructor(code) {
        super(code);
        this.name = "BookingContactValidationError";
        this.code = code;
    }
}

function normalizeBookingContacts(value) {
    if (!Array.isArray(value) || value.length === 0 || value.length > MAX_BOOKING_CONTACTS) {
        throw new BookingContactValidationError("invalid_contact_count");
    }

    const seen = new Set();
    const contacts = value.map((contact) => {
        const name = String(contact?.name || "").trim();
        const email = String(contact?.email || "").trim().toLowerCase();
        const role = String(contact?.role || "").trim().toLowerCase();

        if (!name || name.length > 120) throw new BookingContactValidationError("invalid_contact_name");
        if (!EMAIL_PATTERN.test(email) || email.length > 254) throw new BookingContactValidationError("invalid_contact_email");
        if (!CONTACT_ROLES.has(role)) throw new BookingContactValidationError("invalid_contact_role");

        const duplicateKey = `${email}\u0000${role}`;
        if (seen.has(duplicateKey)) throw new BookingContactValidationError("duplicate_contact");
        seen.add(duplicateKey);

        return { name, email, role, notify: contact.notify !== false };
    });

    if (contacts.filter((contact) => contact.role === "primary").length !== 1) {
        throw new BookingContactValidationError("invalid_primary_contact_count");
    }

    return contacts;
}

module.exports = {
    BookingContactValidationError,
    CONTACT_ROLES,
    MAX_BOOKING_CONTACTS,
    normalizeBookingContacts
};