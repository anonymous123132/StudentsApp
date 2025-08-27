import { haversine } from './utils.js';
import { removeEvent } from './storage.js';

const reminderTimeouts = {};

export function clearReminders(id) {
  (reminderTimeouts[id] || []).forEach(t => clearTimeout(t));
  reminderTimeouts[id] = [];
}

export function scheduleReminders(event, doNotDisturb) {
  clearReminders(event.id);
  const reminders = event.extendedProps.reminders || [];
  const now = Date.now();
  reminders.forEach(minutes => {
    const trigger = event.start.getTime() - minutes * 60000;
    const delay = trigger - now;
    if (delay > 0) {
      const id = setTimeout(() => {
        showNotification(
          `Reminder: ${event.title}`,
          `Starts in ${minutes} minutes`,
          doNotDisturb
        );
      }, delay);
      if (!reminderTimeouts[event.id]) reminderTimeouts[event.id] = [];
      reminderTimeouts[event.id].push(id);
    }
  });
}

function showNotification(title, body, doNotDisturb) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const options = doNotDisturb ? { body, silent: true } : { body };
    new Notification(title, options);
  } else {
    alert(`${title}${body ? ' - ' + body : ''}`);
  }
}

export async function estimateTravelMinutes(
  oLat,
  oLng,
  dLat,
  dLng,
  mode,
  provider = 'google'
) {
  try {
    if (
      navigator.onLine &&
      provider === 'osrm' &&
      ['car', 'bike', 'walk'].includes(mode)
    ) {
      const profiles = { car: 'driving', bike: 'cycling', walk: 'walking' };
      const url = `https://router.project-osrm.org/route/v1/${profiles[mode]}/${oLng},${oLat};${dLng},${dLat}?overview=false`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        return data.routes[0].duration / 60;
      }
    }
  } catch (_) {
    // ignore and fall back
  }
  const speeds = { transit: 30, car: 50, walk: 5, bike: 15 };
  const speed = speeds[mode] || 50;
  const distKm = haversine(oLat, oLng, dLat, dLng);
  return (distKm / speed) * 60;
}

export async function maybeAddTravelEvent(
  calendar,
  event,
  lat,
  lng,
  persistEvent,
  updateEvent,
  profile,
  doNotDisturb
) {
  if (!profile || isNaN(profile.homeLat) || isNaN(profile.homeLng)) return;
  const travelMinutes = await estimateTravelMinutes(
    profile.homeLat,
    profile.homeLng,
    lat,
    lng,
    profile.mode,
    profile.provider
  );
  const travelEnd = new Date(
    event.start.getTime() - (profile.buffer / 2) * 60000
  );
  const travelStart = new Date(
    event.start.getTime() - (travelMinutes + profile.buffer) * 60000
  );
  if (profile.policy === 'extend') {
    event.setStart(travelStart);
    updateEvent(event);
    return;
  }
  const existing = calendar
    .getEvents()
    .find(ev =>
      ev.extendedProps.isTravel &&
      Math.abs(ev.extendedProps.destLat - lat) < 0.0001 &&
      Math.abs(ev.extendedProps.destLng - lng) < 0.0001 &&
      Math.abs(ev.end.getTime() - travelStart.getTime()) <= 15 * 60000
    );
  if (existing) {
    existing.setEnd(travelEnd);
    updateEvent(existing);
    return;
  }
  if (travelStart > new Date()) {
    const data = {
      title: 'Travel to ' + event.title,
      start: travelStart.toISOString().substring(0, 16),
      end: travelEnd.toISOString().substring(0, 16),
      allDay: false,
      description: '',
      location: '',
      lat: '',
      lng: '',
      smartTravel: false,
      onlineLink: '',
      reminders: [],
      category: '',
      recurrence: 'none',
      calendar: event.extendedProps.calendar || 'Personal',
      backgroundColor: '#555',
      borderColor: '#555',
      isTravel: true,
      destLat: lat,
      destLng: lng
    };
    const travelEvent = calendar.addEvent(data);
    persistEvent(travelEvent);
    scheduleReminders(travelEvent, doNotDisturb);
  }
}

export async function recalcTravelEvents(
  calendar,
  persistEvent,
  updateEvent,
  doNotDisturb,
  profile
) {
  calendar.getEvents().forEach(ev => {
    if (ev.extendedProps.isTravel) {
      removeEvent(ev);
      ev.remove();
    }
  });
  const events = calendar.getEvents();
  for (const ev of events) {
    if (
      !ev.extendedProps.isTravel &&
      !isNaN(ev.extendedProps.lat) &&
      !isNaN(ev.extendedProps.lng) &&
      ev.start > new Date()
    ) {
      await maybeAddTravelEvent(
        calendar,
        ev,
        parseFloat(ev.extendedProps.lat),
        parseFloat(ev.extendedProps.lng),
        persistEvent,
        updateEvent,
        profile,
        doNotDisturb
      );
    }
  }
}
