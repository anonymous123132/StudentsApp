export function createRecurringEvents(base, rule, occurrences = 4) {
  const events = [];
  const startDate = new Date(base.start);
  const endDate = base.end ? new Date(base.end) : null;
  for (let i = 1; i <= occurrences; i++) {
    const s = new Date(startDate);
    const e = endDate ? new Date(endDate) : null;
    switch (rule) {
      case 'daily':
        s.setDate(s.getDate() + i);
        if (e) e.setDate(e.getDate() + i);
        break;
      case 'weekly':
        s.setDate(s.getDate() + 7 * i);
        if (e) e.setDate(e.getDate() + 7 * i);
        break;
      case 'monthly':
        s.setMonth(s.getMonth() + i);
        if (e) e.setMonth(e.getMonth() + i);
        break;
      case 'yearly':
        s.setFullYear(s.getFullYear() + i);
        if (e) e.setFullYear(e.getFullYear() + i);
        break;
      default:
        continue;
    }
    events.push({
      ...base,
      start: base.allDay
        ? s.toISOString().substring(0, 10)
        : s.toISOString().substring(0, 16),
      end: e
        ? base.allDay
          ? e.toISOString().substring(0, 10)
          : e.toISOString().substring(0, 16)
        : null
    });
  }
  return events;
}
