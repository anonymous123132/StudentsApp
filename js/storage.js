export function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem('calendarEvents') || '[]').map(e => ({
      ...e,
      calendar: e.calendar || 'Personal',
      backgroundColor: e.color,
      borderColor: e.color,
      attachments: e.attachments || [],
      participants: e.participants || [],
      timeZone: e.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
    }));
  } catch {
    return [];
  }
}

export function persistEvent(event) {
  const events = loadEvents();
  events.push({
    id: event.id,
    title: event.title,
    start: event.startStr,
    end: event.endStr,
    allDay: event.allDay,
    description: event.extendedProps.description || '',
    location: event.extendedProps.location || '',
    lat: event.extendedProps.lat || '',
    lng: event.extendedProps.lng || '',
    smartTravel: event.extendedProps.smartTravel || false,
    onlineLink: event.extendedProps.onlineLink || '',
    color: event.backgroundColor,
    reminders: event.extendedProps.reminders || [],
    category: event.extendedProps.category || '',
    recurrence: event.extendedProps.recurrence || 'none',
    calendar: event.extendedProps.calendar || 'Personal',
    attachments: event.extendedProps.attachments || [],
    participants: event.extendedProps.participants || [],
    timeZone: event.extendedProps.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    isTravel: event.extendedProps.isTravel || false
  });
  localStorage.setItem('calendarEvents', JSON.stringify(events));
}

export function updateEvent(event) {
  const events = loadEvents().map(e =>
    e.id === event.id
      ? {
          id: event.id,
          title: event.title,
          start: event.startStr,
          end: event.endStr,
          allDay: event.allDay,
          description: event.extendedProps.description || '',
          location: event.extendedProps.location || '',
          lat: event.extendedProps.lat || '',
          lng: event.extendedProps.lng || '',
          smartTravel: event.extendedProps.smartTravel || false,
          onlineLink: event.extendedProps.onlineLink || '',
          color: event.backgroundColor,
          reminders: event.extendedProps.reminders || [],
          category: event.extendedProps.category || '',
          recurrence: event.extendedProps.recurrence || 'none',
          calendar: event.extendedProps.calendar || 'Personal',
          attachments: event.extendedProps.attachments || [],
          participants: event.extendedProps.participants || [],
          timeZone: event.extendedProps.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          isTravel: event.extendedProps.isTravel || false
        }
      : e
  );
  localStorage.setItem('calendarEvents', JSON.stringify(events));
}

export function removeEvent(event) {
  const events = loadEvents().filter(e => e.id !== event.id);
  localStorage.setItem('calendarEvents', JSON.stringify(events));
}

export function loadCategories() {
  try {
    return JSON.parse(localStorage.getItem('eventCategories') || '[]');
  } catch {
    return [];
  }
}

export function saveCategories(categories) {
  localStorage.setItem('eventCategories', JSON.stringify(categories));
}

export function loadCourses() {
  try {
    return JSON.parse(localStorage.getItem('courses') || '[]');
  } catch {
    return [];
  }
}

export function saveCourses(courses) {
  localStorage.setItem('courses', JSON.stringify(courses));
}

export function loadWorkProfiles() {
  try {
    return JSON.parse(localStorage.getItem('workProfiles') || '[]');
  } catch {
    return [];
  }
}

export function saveWorkProfiles(profiles) {
  localStorage.setItem('workProfiles', JSON.stringify(profiles));
}

export function loadDnd() {
  try {
    return JSON.parse(localStorage.getItem('dndMode')) || false;
  } catch {
    return false;
  }
}
