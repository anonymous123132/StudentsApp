import { getGoogleCalendarUrl, getOutlookCalendarUrl } from '../js/sync.js';

describe('sync', () => {
  const event = {
    title: 'Meeting',
    description: 'Discuss',
    location: 'Room',
    start: new Date('2024-01-01T10:00:00Z'),
    end: new Date('2024-01-01T11:00:00Z')
  };

  test('google calendar url contains details', () => {
    const url = getGoogleCalendarUrl(event);
    expect(url).toContain('https://www.google.com/calendar/render?');
    expect(url).toContain('text=Meeting');
    expect(url).toContain('location=Room');
  });

  test('outlook url contains details', () => {
    const url = getOutlookCalendarUrl(event);
    expect(url).toContain('https://outlook.live.com/owa/?');
    expect(url).toContain('subject=Meeting');
    expect(url).toContain('location=Room');
  });
});
