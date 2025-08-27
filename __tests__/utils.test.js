import {
  parseIcs,
  parseIcsDate,
  formatIcsDate,
  haversine,
  getHebrewDate,
  getMapLink
} from '../js/utils.js';

describe('utils', () => {
  test('parseIcs extracts events', () => {
    const ics = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:Meeting\nDESCRIPTION:Discuss\nLOCATION:Room\nDTSTART:20240101T120000\nDTEND:20240101T130000\nEND:VEVENT\nEND:VCALENDAR`;
    const events = parseIcs(ics);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      title: 'Meeting',
      start: '2024-01-01T12:00',
      end: '2024-01-01T13:00',
      allDay: false,
      description: 'Discuss',
      location: 'Room'
    });
  });

  test('parseIcsDate handles all-day and timed', () => {
    expect(parseIcsDate('20240101')).toEqual({ value: '2024-01-01', allDay: true });
    expect(parseIcsDate('20240101T120000')).toEqual({ value: '2024-01-01T12:00', allDay: false });
  });

  test('formatIcsDate formats correctly', () => {
    const date = new Date('2024-01-01T12:34:00Z');
    expect(formatIcsDate(date, false)).toBe('20240101T123400Z');
    const day = new Date('2024-01-01T00:00:00Z');
    expect(formatIcsDate(day, true)).toBe('20240101');
  });

  test('haversine computes distance', () => {
    const dist = haversine(0, 0, 0, 1); // roughly 111 km per degree
    expect(dist).toBeCloseTo(111, 0);
  });

  test('getHebrewDate formats date', () => {
    const formatted = getHebrewDate(new Date('2023-09-16'));
    expect(formatted).toBe('1 בתשרי');
  });

  test('getMapLink builds google maps urls', () => {
    expect(getMapLink('Tel Aviv', NaN, NaN)).toBe(
      'https://www.google.com/maps?q=Tel%20Aviv'
    );
    expect(getMapLink('', 1, 2)).toBe('https://www.google.com/maps?q=1,2');
    expect(getMapLink('', NaN, NaN)).toBe('');
  });
});
