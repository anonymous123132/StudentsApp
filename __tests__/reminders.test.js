import { jest } from '@jest/globals';
import * as reminders from '../js/reminders.js';
const {
  clearReminders,
  scheduleReminders,
  maybeAddTravelEvent,
  estimateTravelMinutes
} = reminders;

describe('reminders', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.Notification = function(title, options) {
      global.__notified = { title, options };
    };
    Notification.permission = 'granted';
    delete global.__notified;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('scheduleReminders triggers notification', () => {
    const event = {
      id: '1',
      title: 'Test',
      start: new Date(Date.now() + 1000),
      extendedProps: { reminders: [0] }
    };
    scheduleReminders(event, false);
    jest.runAllTimers();
    expect(global.__notified.title).toBe('Reminder: Test');
  });

  test('clearReminders cancels notifications', () => {
    const event = {
      id: '2',
      title: 'Test',
      start: new Date(Date.now() + 1000),
      extendedProps: { reminders: [0] }
    };
    scheduleReminders(event, false);
    clearReminders('2');
    jest.runAllTimers();
    expect(global.__notified).toBeUndefined();
  });

  test('maybeAddTravelEvent adds travel event using profile', async () => {
    const calendar = {
      addEvent: jest.fn().mockReturnValue({
        id: 't',
        start: new Date(),
        end: new Date(),
        startStr: '',
        extendedProps: { isTravel: true }
      }),
      getEvents: () => []
    };
    const future = Date.now() + 24 * 3600000;
    const event = {
      title: 'Meeting',
      start: new Date(future),
      startStr: new Date(future).toISOString().substring(0, 16),
      setStart: jest.fn(),
      extendedProps: { calendar: 'Personal' }
    };
    const persistEvent = jest.fn();
    const updateEvent = jest.fn();
    const profile = {
      homeLat: 0,
      homeLng: 0,
      mode: 'car',
      buffer: 10,
      policy: 'event',
      provider: 'google'
    };
    global.fetch = jest.fn().mockRejectedValue('offline');
    await maybeAddTravelEvent(
      calendar,
      event,
      0,
      0.262,
      persistEvent,
      updateEvent,
      profile,
      false
    );
    const args = calendar.addEvent.mock.calls[0][0];
    const expectedStart = new Date(
      future - (35 + 10) * 60000
    )
      .toISOString()
      .substring(0, 16);
    const expectedEnd = new Date(future - 5 * 60000)
      .toISOString()
      .substring(0, 16);
    expect(args.start).toBe(expectedStart);
    expect(args.end).toBe(expectedEnd);
  });

  test('maybeAddTravelEvent can extend event', async () => {
    const calendar = { addEvent: jest.fn(), getEvents: () => [] };
    const start = new Date(Date.now() + 24 * 3600000);
    const event = {
      title: 'Meeting',
      start,
      startStr: start.toISOString().substring(0, 16),
      setStart: jest.fn(),
      extendedProps: { calendar: 'Personal' }
    };
    const persistEvent = jest.fn();
    const updateEvent = jest.fn();
    const profile = {
      homeLat: 0,
      homeLng: 0,
      mode: 'walk',
      buffer: 10,
      policy: 'extend',
      provider: 'google'
    };
    global.fetch = jest.fn().mockRejectedValue('offline');
    await maybeAddTravelEvent(
      calendar,
      event,
      0,
      0.0376,
      persistEvent,
      updateEvent,
      profile,
      false
    );
    expect(calendar.addEvent).not.toHaveBeenCalled();
    expect(event.setStart).toHaveBeenCalled();
    expect(updateEvent).toHaveBeenCalled();
  });

  test('maybeAddTravelEvent merges with existing travel block', async () => {
    const future2 = Date.now() + 24 * 3600000;
    const travelMinutes = 50;
    const travelStart = future2 - (travelMinutes + 10) * 60000;
    const existing = {
      id: 'travel1',
      extendedProps: { isTravel: true, destLat: 0, destLng: 0.3757, reminders: [] },
      end: new Date(travelStart),
      setEnd: jest.fn()
    };
    const calendar = {
      addEvent: jest.fn(),
      getEvents: () => [existing]
    };
    const event = {
      title: 'Class',
      start: new Date(future2),
      startStr: new Date(future2).toISOString().substring(0, 16),
      setStart: jest.fn(),
      extendedProps: { calendar: 'Personal' }
    };
    const persistEvent = jest.fn();
    const updateEvent = jest.fn();
    const profile = {
      homeLat: 0,
      homeLng: 0,
      mode: 'car',
      buffer: 10,
      policy: 'event',
      provider: 'google'
    };
    global.fetch = jest.fn().mockRejectedValue('offline');
    await maybeAddTravelEvent(
      calendar,
      event,
      0,
      0.3757,
      persistEvent,
      updateEvent,
      profile,
      false
    );
    expect(calendar.addEvent).not.toHaveBeenCalled();
    expect(existing.setEnd).toHaveBeenCalled();
  });

  test('estimateTravelMinutes shorter for car than transit', async () => {
    global.fetch = jest.fn().mockRejectedValue('offline');
    const transit = await estimateTravelMinutes(0, 0, 0, 0.3, 'transit', 'google');
    const car = await estimateTravelMinutes(0, 0, 0, 0.3, 'car', 'google');
    expect(car).toBeLessThan(transit);
  });
});
