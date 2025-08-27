import {
  loadEvents,
  persistEvent,
  updateEvent,
  removeEvent,
  loadCategories,
  saveCategories,
  loadDnd
} from '../js/storage.js';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  function createEvent(id = '1', title = 'Test') {
    return {
      id,
      title,
      startStr: '2024-01-01T10:00',
      endStr: '2024-01-01T11:00',
      start: new Date('2024-01-01T10:00'),
      end: new Date('2024-01-01T11:00'),
      allDay: false,
      backgroundColor: '#000',
      extendedProps: {
        description: '',
        location: '',
        lat: '',
        lng: '',
        smartTravel: false,
        onlineLink: '',
        reminders: [],
        category: '',
        recurrence: 'none',
        calendar: 'Personal',
        attachments: [],
        participants: [],
        timeZone: 'UTC',
        isTravel: false
      }
    };
  }

  test('loadEvents returns empty array by default', () => {
    expect(loadEvents()).toEqual([]);
  });

  test('persistEvent saves and loadEvents retrieves', () => {
    const ev = createEvent();
    persistEvent(ev);
    const events = loadEvents();
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('Test');
  });

  test('updateEvent updates existing event', () => {
    const ev = createEvent('2', 'Old');
    persistEvent(ev);
    const updated = createEvent('2', 'New');
    updateEvent(updated);
    const events = loadEvents();
    expect(events[0].title).toBe('New');
  });

  test('removeEvent removes event', () => {
    const ev = createEvent('3');
    persistEvent(ev);
    removeEvent(ev);
    expect(loadEvents()).toHaveLength(0);
  });

  test('saveCategories and loadCategories work', () => {
    saveCategories([{ name: 'Work', color: '#f00' }]);
    expect(loadCategories()).toEqual([{ name: 'Work', color: '#f00' }]);
  });

  test('loadDnd reads value', () => {
    expect(loadDnd()).toBe(false);
    localStorage.setItem('dndMode', 'true');
    expect(loadDnd()).toBe(true);
  });
});
