export const DEFAULT_SCHEDULE_SETTINGS = {
    method: "drag",
    slotDurationMinutes: 60,
    allowMultipleSlots: false,
    maxSlots: 1,
    recurrenceAllowed: false,
    maxRecurrences: 1,
    activationMode: "permanent",
    activationDate: ""
};

export function normalizeScheduleSettings(settings = {}) {
    const method = settings.method === "fixed" ? "fixed" : "drag";
    const activationMode = ["permanent", "from-date", "single-day"].includes(settings.activationMode) ? settings.activationMode : "permanent";
    return {
        ...DEFAULT_SCHEDULE_SETTINGS,
        ...settings,
        method,
        slotDurationMinutes: clampInteger(settings.slotDurationMinutes, 15, 1440, DEFAULT_SCHEDULE_SETTINGS.slotDurationMinutes),
        allowMultipleSlots: Boolean(settings.allowMultipleSlots),
        maxSlots: clampInteger(settings.maxSlots, 1, 20, DEFAULT_SCHEDULE_SETTINGS.maxSlots),
        recurrenceAllowed: Boolean(settings.recurrenceAllowed),
        maxRecurrences: clampInteger(settings.maxRecurrences, 1, 52, DEFAULT_SCHEDULE_SETTINGS.maxRecurrences),
        activationMode,
        activationDate: typeof settings.activationDate === "string" ? settings.activationDate : ""
    };
}

function clampInteger(value, min, max, fallback) {
    const number = Number(value);
    return Number.isInteger(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

export function buildPublicScheduleSettings(workingHours = {}) {
    const scheduleSettings = normalizeScheduleSettings(workingHours.scheduleSettings);
    return {
        workingDays: Array.isArray(workingHours.workingDays) ? workingHours.workingDays.filter((day) => Number.isInteger(day) && day >= 1 && day <= 7) : [1, 2, 3, 4, 5],
        startTime: typeof workingHours.startTime === "string" ? workingHours.startTime : "09:00",
        endTime: typeof workingHours.endTime === "string" ? workingHours.endTime : "17:00",
        scheduleSettings
    };
}