import { jest } from '@jest/globals';
import { setupIcs, generateIcsBlob } from '../js/ics.js';

describe('ics setup', () => {
  test('import button opens file input', () => {
    const importBtn = document.createElement('button');
    const exportBtn = document.createElement('button');
    const shareBtn = document.createElement('button');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.click = jest.fn();
    const calendar = { addEvent: jest.fn(), getEvents: () => [] };
    const persist = jest.fn();
    const sched = jest.fn();
    const apply = jest.fn();
    setupIcs(importBtn, exportBtn, shareBtn, fileInput, calendar, persist, sched, apply);
    importBtn.click();
    expect(fileInput.click).toHaveBeenCalled();
  });

  test('export button triggers download', () => {
    const importBtn = document.createElement('button');
    const exportBtn = document.createElement('button');
    const shareBtn = document.createElement('button');
    const fileInput = document.createElement('input');
    const ev = { title: 'Test', extendedProps: {}, start: new Date('2024-01-01'), allDay: true };
    const calendar = { addEvent: jest.fn(), getEvents: () => [ev] };
    const persist = jest.fn();
    const sched = jest.fn();
    const apply = jest.fn();
    const origCreate = document.createElement;
    const anchor = { click: jest.fn(), set href(v) {}, set download(v) {} };
    global.URL.createObjectURL = jest.fn(() => 'blob:123');
    global.URL.revokeObjectURL = jest.fn();
    document.createElement = jest.fn(tag => (tag === 'a' ? anchor : origCreate.call(document, tag)));
    setupIcs(importBtn, exportBtn, shareBtn, fileInput, calendar, persist, sched, apply);
    exportBtn.click();
    expect(anchor.click).toHaveBeenCalled();
  });

  test('share button uses navigator.share when available', () => {
    const importBtn = document.createElement('button');
    const exportBtn = document.createElement('button');
    const shareBtn = document.createElement('button');
    const fileInput = document.createElement('input');
    const ev = { title: 'Test', extendedProps: {}, start: new Date('2024-01-01'), allDay: true };
    const calendar = { addEvent: jest.fn(), getEvents: () => [ev] };
    const persist = jest.fn();
    const sched = jest.fn();
    const apply = jest.fn();
    Object.assign(global.navigator, {
      share: jest.fn().mockResolvedValue(),
      canShare: () => true
    });
    global.prompt = jest.fn();
    setupIcs(importBtn, exportBtn, shareBtn, fileInput, calendar, persist, sched, apply);
    shareBtn.click();
    expect(global.navigator.share).toHaveBeenCalled();
  });
});

describe('generateIcsBlob', () => {
  test('produces ICS blob with events', async () => {
    const ev = { title: 'Test', extendedProps: {}, start: new Date('2024-01-01'), allDay: true };
    const calendar = { getEvents: () => [ev] };
    const blob = generateIcsBlob(calendar);
    expect(blob.type).toBe('text/calendar');
    expect(blob.size).toBeGreaterThan(0);
  });
});
