import { quickAddStudy } from '../js/study.js';

function createCalendar() {
  return {
    events: [],
    addEvent(data) {
      const event = {
        id: String(this.events.length + 1),
        title: data.title,
        start: new Date(data.start),
        end: data.end ? new Date(data.end) : null,
        allDay: data.allDay,
        backgroundColor: data.backgroundColor,
        borderColor: data.borderColor,
        extendedProps: data.extendedProps || {},
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

describe('quick study add', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('creates study blocks without conflicts', () => {
    const cal = createCalendar();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const classStart = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate(),
      9,
      0
    );
    cal.addEvent({
      title: 'Class',
      start: classStart.toISOString().substring(0, 16),
      end: new Date(classStart.getTime() + 60 * 60000).toISOString().substring(0, 16),
      allDay: false,
      extendedProps: {}
    });
    const due1 = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 16);
    const due2 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 16);
    localStorage.setItem(
      'courses',
      JSON.stringify([
        { name: 'Course A', color: '#f00', assignments: [{ title: 'HW1', due: due1 }] },
        { name: 'Course B', color: '#0f0', assignments: [{ title: 'HW2', due: due2 }] }
      ])
    );
    const workDue = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 16);
    localStorage.setItem(
      'workProfiles',
      JSON.stringify([
        {
          name: 'Job',
          tasks: [
            {
              title: 'Report',
              due: workDue,
              includeInStudy: true,
              subtasks: [
                { title: 'Part1', estMin: 30, done: true },
                { title: 'Part2', estMin: 30, done: false }
              ]
            }
          ]
        }
      ])
    );
    const created = quickAddStudy(cal, () => {});
    expect(created.length).toBeGreaterThan(0);
    expect(created.length).toBeLessThanOrEqual(3);
    expect(created[0].title).toContain('HW1');
    expect(created.some(ev => ev.title.includes('Report'))).toBe(true);
    const minStart = new Date(classStart.getTime() + 90 * 60000);
    created.forEach(ev => {
      expect(ev.start.getTime()).toBeGreaterThanOrEqual(minStart.getTime());
    });
  });
});
