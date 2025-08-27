export function hasConflict(calendar, start, end, excludeId = null) {
  return calendar.getEvents().some(ev => {
    if (excludeId && ev.id === excludeId) return false;
    const evStart = ev.start;
    const evEnd = ev.end || ev.start;
    return start < evEnd && end > evStart;
  });
}
