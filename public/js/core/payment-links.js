export function normalizeCustomPaymentLinks(paymentInfo = {}) {
    const links = Array.isArray(paymentInfo.customPaymentLinks)
        ? paymentInfo.customPaymentLinks
            .map((link) => ({ label: String(link?.label || "").trim(), url: String(link?.url || "").trim() }))
            .filter((link) => link.label || link.url)
        : [];
    if (links.length) return links;
    const legacyLink = {
        label: String(paymentInfo.customBankName || "").trim(),
        url: String(paymentInfo.customBankUrl || "").trim()
    };
    return legacyLink.label || legacyLink.url ? [legacyLink] : [];
}