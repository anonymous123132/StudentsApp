import { parseRRule, generateOccurrences } from '../js/advancedRecurrence.js';

describe('advanced recurrence', () => {
  test('parseRRule splits fields', () => {
    const rule = parseRRule('FREQ=WEEKLY;INTERVAL=2;COUNT=3');
    expect(rule).toEqual({ FREQ: 'WEEKLY', INTERVAL: '2', COUNT: '3' });
  });

  test('generateOccurrences creates dates', () => {
    const start = new Date('2024-01-01T00:00:00Z');
    const occ = generateOccurrences(start, 'FREQ=DAILY;COUNT=3');
    expect(occ.map(d => d.toISOString())).toEqual([
      '2024-01-01T00:00:00.000Z',
      '2024-01-02T00:00:00.000Z',
      '2024-01-03T00:00:00.000Z'
    ]);
  });
});
