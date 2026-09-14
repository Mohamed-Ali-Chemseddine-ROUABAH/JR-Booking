function getParisParts(value) {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).formatToParts(value).reduce((parts, item) => {
        if (item.type !== "literal") parts[item.type] = Number(item.value);
        return parts;
    }, {});
}

function isDigestWindow(value) {
    const parts = getParisParts(value);
    return parts.hour === 8 && parts.minute < 15;
}

function getDigestDate(value) {
    const parts = getParisParts(value);
    return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function buildDigestMail(notificationData, digestDate) {
    const items = notificationData.map((item) => String(item.body || item.title || "Notification de réservation").slice(0, 240));
    const count = items.length;
    return {
        subject: `Résumé quotidien : ${count} notification${count > 1 ? "s" : ""} de réservation`,
        text: `Voici les notifications de réservation non lues du ${digestDate} :\n${items.map((item) => `- ${item}`).join("\n")}`
    };
}

module.exports = { isDigestWindow, getDigestDate, buildDigestMail };
