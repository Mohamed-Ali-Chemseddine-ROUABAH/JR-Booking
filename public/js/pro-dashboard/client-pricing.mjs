export function applyClientPricingOverrides({ paymentInfo = {}, movementQuote = null, clientRecord = {} } = {}) {
    const rateOverride = readNonNegative(clientRecord.customRate);
    const surchargeOverride = readNonNegative(clientRecord.movementSurcharge);
    const ratePerUnit = rateOverride ?? (Number(paymentInfo.ratePerUnit) || 0);
    const surcharge = movementQuote ? (surchargeOverride ?? (Number(movementQuote.surcharge) || 0)) : 0;
    return { ratePerUnit, surcharge };
}

export function readNonNegative(value) {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
