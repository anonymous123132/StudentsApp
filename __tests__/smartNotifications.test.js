import { jest } from '@jest/globals';
import { scheduleSmartNotification } from '../js/smartNotifications.js';

jest.useFakeTimers();

describe('smart notifications', () => {
  test('schedules notification before event', () => {
    const event = {
      title: 'Class',
      start: new Date(Date.now() + 3600000), // 1 hour from now
      extendedProps: { lat: 0, lng: 0 }
    };
    const notify = jest.fn();
    const id = scheduleSmartNotification(event, 0, 0, notify);
    expect(typeof id).toBe('number');
    jest.advanceTimersByTime(3600000);
    expect(notify).toHaveBeenCalledWith('Leave for Class');
  });
});
