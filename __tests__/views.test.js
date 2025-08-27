import { calendarOptions, hasWeekView } from '../js/views.js';

test('week view exists in calendar options', () => {
  const opts = calendarOptions(() => {}, () => {}, []);
  expect(hasWeekView(opts)).toBe(true);
});
