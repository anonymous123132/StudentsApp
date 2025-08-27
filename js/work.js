import { maybeAddTravelEvent, scheduleReminders } from './reminders.js';

export async function addWorkShift(
  calendar,
  workProfile,
  shift,
  persistEvent,
  updateEvent,
  profile,
  doNotDisturb
) {
  const now = new Date();
  const diff = (shift.dayOfWeek - now.getDay() + 7) % 7;
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  const [sh, sm] = shift.startTime.split(':').map(Number);
  const [eh, em] = shift.endTime.split(':').map(Number);
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), sh, sm);
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), eh, em);
  const ev = calendar.addEvent({
    title: `Work: ${workProfile.name}`,
    start: start.toISOString().substring(0, 16),
    end: end.toISOString().substring(0, 16),
    allDay: false,
    extendedProps: {
      calendar: 'Work',
      isWork: true,
      remote: shift.mode === 'remote'
    },
    backgroundColor: '#888',
    borderColor: '#888'
  });
  persistEvent(ev);
  scheduleReminders(ev, doNotDisturb);
  if (shift.mode === 'physical' && workProfile.lat != null && workProfile.lng != null) {
    await maybeAddTravelEvent(
      calendar,
      ev,
      workProfile.lat,
      workProfile.lng,
      persistEvent,
      updateEvent,
      profile,
      doNotDisturb
    );
  }
  return ev;
}
