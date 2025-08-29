import { jest } from '@jest/globals';
import { createCourse, addAssignment } from '../js/courses.js';
import { recalcTravelEvents } from '../js/reminders.js';

function createCalendar() {
  return {
    events: [],
    addEvent(data) {
      const known = [
        'title',
        'start',
        'end',
        'allDay',
        'backgroundColor',
        'borderColor',
        'extendedProps'
      ];
      const ext = { ...(data.extendedProps || {}) };
      Object.keys(data).forEach(k => {
        if (!known.includes(k)) ext[k] = data[k];
      });
      const event = {
        id: String(this.events.length + 1),
        title: data.title,
        start: new Date(data.start),
        end: data.end ? new Date(data.end) : null,
        allDay: data.allDay,
        backgroundColor: data.backgroundColor,
        borderColor: data.borderColor,
        extendedProps: ext,
        setExtendedProp(key, value) {
          this.extendedProps[key] = value;
        },
        setStart(date) {
          this.start = date;
        },
        setEnd(date) {
          this.end = date;
        },
        remove() {
          const idx = this.calendar.events.indexOf(this);
          if (idx >= 0) this.calendar.events.splice(idx, 1);
        },
        calendar: null
      };
      event.calendar = this;
      this.events.push(event);
      return event;
    },
    getEvents() {
      return this.events;
    },
    getEventById(id) {
      return this.events.find(e => e.id === id);
    }
  };
}

describe('QA scenarios', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockRejectedValue('offline');
  });

  test('physical and online meetings generate travel only for physical', async () => {
    const cal = createCalendar();
    const today = new Date();
    const course = {
      name: 'CS',
      code: 'C1',
      semester: 'A',
      color: '#f00',
      meetings: [
        {
          type: 'Lecture',
          day: (today.getDay() + 1) % 7,
          start: '09:00',
          end: '10:00',
          locationType: 'physical',
          location: 'B-204',
          lat: 0,
          lng: 0.2,
          reminders: [],
          weeks: 1
        },
        {
          type: 'Lab',
          day: (today.getDay() + 1) % 7,
          start: '11:00',
          end: '12:00',
          locationType: 'online',
          location: 'https://zoom',
          reminders: [],
          weeks: 1
        }
      ],
      assignments: []
    };
    createCourse(course, cal, () => {});
    const profile = { homeLat: 0, homeLng: 0, mode: 'car', buffer: 10, policy: 'event', provider: 'google' };
    await recalcTravelEvents(cal, () => {}, () => {}, false, profile);
    const travel = cal.events.filter(e => e.extendedProps.isTravel);
    expect(travel).toHaveLength(1);
    expect(travel[0].title).toBe('Travel to CS Lecture');
  });

  test('assignment with chapters schedules study sessions', () => {
    const cal = createCalendar();
    const course = { name: 'Math', color: '#0f0', assignments: [] };
    const due = new Date(Date.now() + 96 * 60 * 60 * 1000);
    addAssignment(
      course,
      {
        title: 'HW1',
        due: due.toISOString().substring(0, 16),
        chapters: '3.1-3.4'
      },
      cal,
      () => {}
    );
    const assignmentEvent = cal.events.find(e => e.title.startsWith('Math: HW1'));
    expect(assignmentEvent).toBeTruthy();
    const study = cal.events.filter(e => e.extendedProps.isStudy);
    expect(study).toHaveLength(3);
    study.forEach(ev => {
      expect(ev.start.getTime()).toBeGreaterThanOrEqual(
        due.getTime() - 72 * 60 * 60 * 1000 - 60000
      );
      expect(ev.start.getTime()).toBeLessThanOrEqual(
        due.getTime() - 24 * 60 * 60 * 1000 + 60000
      );
    });
  });

  test('changing home address recalculates travel blocks', async () => {
    const cal = createCalendar();
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    cal.addEvent({
      title: 'Meeting',
      start: start.toISOString().substring(0, 16),
      end: new Date(start.getTime() + 60 * 60 * 1000).toISOString().substring(0, 16),
      allDay: false,
      extendedProps: { lat: 0, lng: 0.5, calendar: 'Study' }
    });
    let profile = { homeLat: 0, homeLng: 0, mode: 'car', buffer: 10, policy: 'event', provider: 'google' };
    await recalcTravelEvents(cal, () => {}, () => {}, false, profile);
    let travel = cal.events.find(e => e.extendedProps.isTravel);
    const first = travel.start.getTime();
    profile = { homeLat: 1, homeLng: 0, mode: 'car', buffer: 10, policy: 'event', provider: 'google' };
    await recalcTravelEvents(cal, () => {}, () => {}, false, profile);
    travel = cal.events.find(e => e.extendedProps.isTravel);
    expect(travel.start.getTime()).not.toBe(first);
  });
});
