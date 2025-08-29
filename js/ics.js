import { parseIcs, formatIcsDate } from './utils.js';

export function generateIcsBlob(calendar) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//StudentsApp//EN'];
  calendar.getEvents().forEach(ev => {
    lines.push('BEGIN:VEVENT');
    lines.push('SUMMARY:' + ev.title);
    if (ev.extendedProps.description)
      lines.push('DESCRIPTION:' + ev.extendedProps.description);
    if (ev.extendedProps.location)
      lines.push('LOCATION:' + ev.extendedProps.location);
    lines.push('DTSTART:' + formatIcsDate(ev.start, ev.allDay));
    if (ev.end) lines.push('DTEND:' + formatIcsDate(ev.end, ev.allDay));
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return new Blob([lines.join('\n')], { type: 'text/calendar' });
}

export function setupIcs(importBtn, exportBtn, shareBtn, icsFileInput, calendar, persistEvent, scheduleReminders, applyFilters) {
  importBtn.addEventListener('click', () => icsFileInput.click());

  icsFileInput.addEventListener('change', () => {
    const file = icsFileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      parseIcs(e.target.result).forEach(data => {
        const ev = calendar.addEvent(data);
        persistEvent(ev);
        scheduleReminders(ev);
      });
      applyFilters();
    };
    reader.readAsText(file);
  });

  exportBtn.addEventListener('click', () => {
    const blob = generateIcsBlob(calendar);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendar.ics';
    a.click();
    URL.revokeObjectURL(url);
  });

  shareBtn.addEventListener('click', async () => {
    const blob = generateIcsBlob(calendar);
    const file = new File([blob], 'calendar.ics', { type: 'text/calendar' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Student Calendar' });
      } catch (e) {
        console.error(e);
      }
    } else {
      const url = URL.createObjectURL(blob);
      prompt('Copy this read-only ICS link:', url);
    }
  });
}
