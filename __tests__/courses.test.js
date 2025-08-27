import { createCourse, addAssignment, updateMeetingLocation } from '../js/courses.js';

function createCalendar() {
  return {
    events: [],
    addEvent(data) {
      const event = {
        id: String(this.events.length + 1),
        ...data,
        start: new Date(data.start),
        end: data.end ? new Date(data.end) : null,
        extendedProps: data.extendedProps || {},
        setExtendedProp(key, value) {
          this.extendedProps[key] = value;
        }
      };
      this.events.push(event);
      return event;
    },
    getEventById(id) {
      return this.events.find(e => e.id === id);
    }
  };
}

describe('courses', () => {
  test('createCourse generates meeting events', () => {
    const cal = createCalendar();
    const today = new Date();
    const course = {
      name: 'Math',
      code: 'M101',
      semester: 'A',
      color: '#ff0',
      meetings: [
        {
          type: 'Lecture',
          day: today.getDay(),
          start: '10:00',
          end: '11:00',
          locationType: 'physical',
          location: 'Room 1',
          reminders: [30],
          weeks: 2
        }
      ]
    };
    createCourse(course, cal, () => {});
    expect(course.meetings[0].eventIds).toHaveLength(2);
    expect(cal.events).toHaveLength(2);
  });

  test('addAssignment creates event', () => {
    const cal = createCalendar();
    const course = { name: 'Math', color: '#ff0', assignments: [] };
    addAssignment(
      course,
      { title: 'HW1', due: new Date().toISOString().substring(0, 16) },
      cal,
      () => {}
    );
    expect(course.assignments).toHaveLength(1);
    // assignment event plus three study sessions
    expect(cal.events).toHaveLength(4);
    const study = cal.events.filter(e => e.extendedProps.isStudy);
    expect(study).toHaveLength(3);
  });

  test('updateMeetingLocation changes future events', () => {
    const cal = createCalendar();
    const today = new Date();
    const course = {
      name: 'Math',
      code: 'M101',
      semester: 'A',
      color: '#ff0',
      meetings: [
        {
          type: 'Lecture',
          day: today.getDay(),
          start: '10:00',
          end: '11:00',
          locationType: 'physical',
          location: 'Room 1',
          reminders: [],
          weeks: 2
        }
      ]
    };
    createCourse(course, cal, () => {});
    const secondStart = cal.getEventById(course.meetings[0].eventIds[1]).start;
    const future = new Date(secondStart.getTime());
    updateMeetingLocation(
      course,
      0,
      { locationType: 'physical', location: 'Room 2' },
      future,
      cal,
      () => {}
    );
    const first = cal.getEventById(course.meetings[0].eventIds[0]);
    const second = cal.getEventById(course.meetings[0].eventIds[1]);
    expect(first.extendedProps.location).toBe('Room 1');
    expect(second.extendedProps.location).toBe('Room 2');
  });
});
