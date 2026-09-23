function buildBanReviewNotification({ recordId, status }) {
    const approved = status === "approved";
    return {
        type: approved ? "platform-ban-approved" : "platform-ban-rejected",
        recordId,
        title: approved ? "Escalade de bannissement approuvée" : "Escalade de bannissement refusée",
        body: approved ? "Votre demande de bannissement a été approuvée." : "Votre demande de bannissement a été refusée.",
        readAt: null
    };
}

function hasBanReviewChange(before, after) {
    const beforeStatus = before?.platformBanRequest?.status || "";
    const afterStatus = after?.platformBanRequest?.status || "";
    return Boolean(after?.platformBanRequest?.requestedBy && ["approved", "rejected"].includes(afterStatus) && afterStatus !== beforeStatus);
}

module.exports = { buildBanReviewNotification, hasBanReviewChange };
