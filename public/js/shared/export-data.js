export function downloadJsonFile(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function buildProfessionalDataExport({ user, profileId, bookings = [] } = {}) {
    return {
        exportedAt: new Date().toISOString(),
        account: {
            uid: user?.uid || "",
            email: user?.email || "",
            displayName: user?.displayName || ""
        },
        profileId: profileId || user?.uid || "",
        bookings: bookings.map(({ id, proId, clientId, start, end, status, service, customPrice, paymentContext, createdBy }) => ({
            id,
            proId,
            clientId,
            start,
            end,
            status,
            service,
            customPrice,
            paymentContext,
            createdBy
        }))
    };
}
