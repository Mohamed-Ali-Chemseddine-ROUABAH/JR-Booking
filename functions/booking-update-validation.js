function normalizeBookingUpdateFields(data = {}) {
    const result = {};
    if (Object.prototype.hasOwnProperty.call(data, "service")) {
        const service = data.service;
        if (service === null) {
            result.service = null;
        } else if (service && typeof service === "object") {
            const name = String(service.name || "").trim().slice(0, 120);
            const durationMinutes = Number(service.durationMinutes);
            const price = Number(service.price);
            if (!name || !Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > 1440 || !Number.isFinite(price) || price < 0 || price > 100000) throw new Error("invalid_service");
            result.service = { name, durationMinutes, price };
        } else {
            throw new Error("invalid_service");
        }
    }
    if (Object.prototype.hasOwnProperty.call(data, "customPrice")) {
        if (data.customPrice === null || data.customPrice === "") {
            result.customPrice = null;
        } else {
            const customPrice = Number(data.customPrice);
            if (!Number.isFinite(customPrice) || customPrice < 0 || customPrice > 100000) throw new Error("invalid_custom_price");
            result.customPrice = customPrice;
        }
    }
    if (Object.prototype.hasOwnProperty.call(data, "clientMessage")) {
        const clientMessage = String(data.clientMessage || "").trim().slice(0, 2000);
        if (clientMessage.length > 2000) throw new Error("invalid_client_message");
        result.clientMessage = clientMessage;
    }
    return result;
}

module.exports = { normalizeBookingUpdateFields };