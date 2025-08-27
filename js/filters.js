export function applyFilters(calendar, searchInput, filterCategory, calendarFilters) {
  const query = searchInput.value.toLowerCase();
  const cat = filterCategory.value;
  const activeCalendars = Array.from(calendarFilters)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  calendar.getEvents().forEach(ev => {
    const matchesSearch =
      !query ||
      ev.title.toLowerCase().includes(query) ||
      (ev.extendedProps.description || '').toLowerCase().includes(query) ||
      (ev.extendedProps.location || '').toLowerCase().includes(query);
    const matchesCategory = !cat || ev.extendedProps.category === cat;
    const matchesCalendar = activeCalendars.includes(
      ev.extendedProps.calendar || 'Personal'
    );
    ev.setProp(
      'display',
      matchesSearch && matchesCategory && matchesCalendar ? 'auto' : 'none'
    );
  });
}
