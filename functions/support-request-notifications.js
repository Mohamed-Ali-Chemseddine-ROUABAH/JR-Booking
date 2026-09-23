function buildRequesterReplyNotification({ kind, requestId, reply }) {
    const isDataRequest = kind === "data-request";
    return {
        type: isDataRequest ? "data-request-reply" : "support-ticket-reply",
        ...(isDataRequest ? { requestId } : { ticketId: requestId }),
        title: isDataRequest ? "Réponse à votre demande de données" : "Réponse du support",
        body: String(reply || "").slice(0, 160),
        readAt: null
    };
}

function hasNewAdminReply(before, after) {
    return Boolean(after?.createdBy && after.adminReply && after.adminReply !== before?.adminReply);
}

module.exports = { buildRequesterReplyNotification, hasNewAdminReply };
