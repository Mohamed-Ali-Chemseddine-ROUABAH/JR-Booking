export function normalizeRequestFields({ subject, details, createdBy }) {
    const normalizedSubject = String(subject || "").trim().slice(0, 120);
    const normalizedDetails = String(details || "").trim().slice(0, 2000);
    if (!normalizedSubject || !normalizedDetails || !createdBy) {
        throw new Error("invalid-request");
    }
    return {
        subject: normalizedSubject,
        details: normalizedDetails,
        createdBy: String(createdBy),
        status: "pending"
    };
}
