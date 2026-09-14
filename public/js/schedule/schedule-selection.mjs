export function toggleFixedSlotSelection(selectedSlots, slot, maxSlots) {
    const next = selectedSlots.some((item) => item.date === slot.date && item.hour === slot.hour)
        ? selectedSlots.filter((item) => item.date !== slot.date || item.hour !== slot.hour)
        : selectedSlots.length >= maxSlots || (selectedSlots.length && selectedSlots.some((item) => item.date !== slot.date))
            ? selectedSlots
            : [...selectedSlots, slot].sort((left, right) => left.hour.localeCompare(right.hour));
    return next;
}

export function buildFixedBookingDetails(selectedSlots, slotDurationMinutes) {
    if (!selectedSlots.length) return null;
    const first = selectedSlots[0];
    return {
        date: first.date,
        hour: first.hour,
        endHour: addMinutesToHour(first.hour, selectedSlots.length * slotDurationMinutes),
        slotCount: selectedSlots.length
    };
}

function addMinutesToHour(hour, minutes) {
    const [hours, currentMinutes] = hour.split(":").map(Number);
    const total = hours * 60 + currentMinutes + minutes;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}