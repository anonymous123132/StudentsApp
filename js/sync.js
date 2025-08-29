export function getGoogleCalendarUrl(event) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || '',
    dates: formatDateRange(event.start, event.end),
    details: event.description || '',
    location: event.location || ''
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function getOutlookCalendarUrl(event) {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    startdt: new Date(event.start).toISOString(),
    enddt: new Date(event.end).toISOString(),
    subject: event.title || '',
    body: event.description || '',
    location: event.location || ''
  });
  return `https://outlook.live.com/owa/?${params.toString()}`;
}

function formatDateRange(start, end) {
  const fmt = d => new Date(d).toISOString().replace(/[-:]|\.\d{3}/g, '');
  return `${fmt(start)}/${fmt(end)}`;
}
