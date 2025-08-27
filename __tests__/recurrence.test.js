import { createRecurringEvents } from '../js/recurrence.js';

describe('createRecurringEvents', () => {
  const base = {
    title: 'Test',
    start: '2024-01-01T10:00',
    end: '2024-01-01T11:00',
    allDay: false,
    backgroundColor: '#000'
  };

  test('generates daily occurrences', () => {
    const events = createRecurringEvents(base, 'daily', 2);
    expect(events).toHaveLength(2);
    expect(events[1].start).toBe('2024-01-03T10:00');
  });

  test('generates weekly occurrences', () => {
    const events = createRecurringEvents(base, 'weekly', 1);
    expect(events[0].start).toBe('2024-01-08T10:00');
  });

  test('returns empty for none rule', () => {
    expect(createRecurringEvents(base, 'none', 2)).toEqual([]);
  });
});
