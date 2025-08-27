import { jest } from '@jest/globals';
import { applyFilters } from '../js/filters.js';

describe('filters', () => {
  test('applyFilters hides and shows events', () => {
    const event1 = {
      title: 'Meeting',
      extendedProps: { description: 'Project', location: 'Room', category: 'Work', calendar: 'Personal' },
      setProp: jest.fn()
    };
    const event2 = {
      title: 'Study',
      extendedProps: { description: '', location: '', category: 'Study', calendar: 'Study' },
      setProp: jest.fn()
    };
    const calendar = { getEvents: () => [event1, event2] };
    const searchInput = { value: 'meet' };
    const filterCategory = { value: '' };
    const cb1 = { checked: true, value: 'Personal' };
    const cb2 = { checked: true, value: 'Study' };
    applyFilters(calendar, searchInput, filterCategory, [cb1, cb2]);
    expect(event1.setProp).toHaveBeenCalledWith('display', 'auto');
    expect(event2.setProp).toHaveBeenCalledWith('display', 'none');
  });
});
