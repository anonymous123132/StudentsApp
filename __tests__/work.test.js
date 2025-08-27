import { addWorkShift } from '../js/work.js';
import { defaultProfile } from '../js/profile.js';

function createCalendar() {
  return {
    events: [],
    addEvent(data) {
      const event = {
        id: String(this.events.length + 1),
        title: data.title,
        start: new Date(data.start),
        end: new Date(data.end),
        allDay: data.allDay,
        extendedProps: { ...(data.extendedProps || {}) },
        backgroundColor: data.backgroundColor,
        borderColor: data.borderColor,
        setStart(d) { this.start = d; },
        setEnd(d) { this.end = d; },
        remove() {}
      };
      if (data.isTravel) event.extendedProps.isTravel = true;
      this.events.push(event);
      return event;
    },
    getEvents() {
      return this.events;
    }
  };
}

describe('work shifts', () => {
  beforeAll(() => {
    global.Notification = function () {};
    Notification.permission = 'granted';
    global.navigator = { onLine: false };
  });

  test('physical shift creates travel event', async () => {
    const cal = createCalendar();
    const profile = { ...defaultProfile, homeLat: 0, homeLng: 0 };
    const workProfile = { id: 'w1', name: 'Store', lat: 0, lng: 0.3 };
    const shift = { dayOfWeek: (new Date().getDay() + 1) % 7, startTime: '08:00', endTime: '16:00', mode: 'physical' };
    await addWorkShift(cal, workProfile, shift, () => {}, () => {}, profile, false);
    expect(cal.events.find(e => e.extendedProps.isTravel)).toBeTruthy();
  });

  test('remote shift has remote flag and no travel', async () => {
    const cal = createCalendar();
    const profile = { ...defaultProfile, homeLat: 0, homeLng: 0 };
    const workProfile = { id: 'w1', name: 'Home', lat: 0, lng: 0 };
    const shift = { dayOfWeek: (new Date().getDay() + 1) % 7, startTime: '08:00', endTime: '16:00', mode: 'remote' };
    await addWorkShift(cal, workProfile, shift, () => {}, () => {}, profile, false);
    expect(cal.events[0].extendedProps.remote).toBe(true);
    expect(cal.events.find(e => e.extendedProps.isTravel)).toBeFalsy();
  });
});
