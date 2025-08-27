export function parseIcs(text) {
  const lines = text.split(/\r?\n/);
  const events = [];
  let cur = null;
  lines.forEach(line => {
    if (line.startsWith('BEGIN:VEVENT')) {
      cur = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (cur && cur.start) {
        events.push({
          title: cur.summary || 'Untitled',
          start: cur.start.value,
          end: cur.end ? cur.end.value : null,
          allDay: cur.start.allDay,
          description: cur.description || '',
          location: cur.location || '',
          reminders: [],
          category: '',
          recurrence: 'none',
          calendar: 'Personal',
          backgroundColor: '#3788d8',
          borderColor: '#3788d8'
        });
      }
      cur = null;
    } else if (cur) {
      if (line.startsWith('SUMMARY:')) cur.summary = line.slice(8);
      else if (line.startsWith('DESCRIPTION:')) cur.description = line.slice(12);
      else if (line.startsWith('LOCATION:')) cur.location = line.slice(9);
      else if (line.startsWith('DTSTART'))
        cur.start = parseIcsDate(line.split(':')[1]);
      else if (line.startsWith('DTEND'))
        cur.end = parseIcsDate(line.split(':')[1]);
    }
  });
  return events;
}

export function parseIcsDate(dt) {
  if (dt.length === 8) {
    return {
      value: `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`,
      allDay: true
    };
  }
  const y = dt.slice(0, 4);
  const m = dt.slice(4, 6);
  const d = dt.slice(6, 8);
  const h = dt.slice(9, 11);
  const min = dt.slice(11, 13);
  return { value: `${y}-${m}-${d}T${h}:${min}`, allDay: false };
}

export function formatIcsDate(date, allDay) {
  const y = date.getFullYear().toString().padStart(4, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  if (allDay) return `${y}${m}${d}`;
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${y}${m}${d}T${h}${min}00Z`;
}

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getHebrewDate(date) {
  return new Intl.DateTimeFormat('he-u-ca-hebrew', {
    day: 'numeric',
    month: 'long'
  }).format(date);
}

export function getMapLink(location, lat, lng) {
  if (!isNaN(lat) && !isNaN(lng)) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  if (location) {
    return `https://www.google.com/maps?q=${encodeURIComponent(location)}`;
  }
  return '';
}

