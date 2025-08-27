import { hasConflict } from '../js/conflicts.js';

describe('hasConflict', () => {
  const mkCal = events => ({ getEvents: () => events });

  test('detects overlapping events', () => {
    const cal = mkCal([
      { id: '1', start: new Date('2024-01-01T10:00'), end: new Date('2024-01-01T11:00') }
    ]);
    expect(
      hasConflict(cal, new Date('2024-01-01T10:30'), new Date('2024-01-01T11:30'))
    ).toBe(true);
  });

  test('no conflict when times do not overlap', () => {
    const cal = mkCal([
      { id: '1', start: new Date('2024-01-01T10:00'), end: new Date('2024-01-01T11:00') }
    ]);
    expect(
      hasConflict(cal, new Date('2024-01-01T11:00'), new Date('2024-01-01T12:00'))
    ).toBe(false);
  });

  test('excludes specified event id', () => {
    const cal = mkCal([
      { id: '1', start: new Date('2024-01-01T10:00'), end: new Date('2024-01-01T11:00') }
    ]);
    expect(
      hasConflict(
        cal,
        new Date('2024-01-01T10:30'),
        new Date('2024-01-01T11:30'),
        '1'
      )
    ).toBe(false);
  });
});
