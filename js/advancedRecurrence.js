export function parseRRule(rrule) {
  return Object.fromEntries(
    rrule.split(';').map(part => {
      const [k, v] = part.split('=');
      return [k.toUpperCase(), v];
    })
  );
}

export function generateOccurrences(start, rrule, max = 10) {
  const rule = typeof rrule === 'string' ? parseRRule(rrule) : rrule;
  const freq = rule.FREQ;
  const interval = parseInt(rule.INTERVAL || '1', 10);
  const until = rule.UNTIL ? new Date(rule.UNTIL) : null;
  const count = rule.COUNT ? parseInt(rule.COUNT, 10) : max;
  const occurrences = [];
  let date = new Date(start);
  while (occurrences.length < count) {
    if (until && date > until) break;
    occurrences.push(new Date(date));
    switch (freq) {
      case 'DAILY':
        date.setDate(date.getDate() + interval);
        break;
      case 'WEEKLY':
        date.setDate(date.getDate() + 7 * interval);
        break;
      case 'MONTHLY':
        date.setMonth(date.getMonth() + interval);
        break;
      case 'YEARLY':
        date.setFullYear(date.getFullYear() + interval);
        break;
      default:
        return occurrences;
    }
  }
  return occurrences;
}
