document.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.getElementById('calendar');
  const modalEl = document.getElementById('eventModal');
  const modal = new bootstrap.Modal(modalEl);

  const titleInput = document.getElementById('eventTitle');
  const startInput = document.getElementById('eventStart');
  const endInput = document.getElementById('eventEnd');
  const descInput = document.getElementById('eventDesc');
  const colorInput = document.getElementById('eventColor');
  const saveBtn = document.getElementById('saveEvent');
  const deleteBtn = document.getElementById('deleteEvent');

  let selectedEvent = null;
  let isAllDay = false;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    themeSystem: 'bootstrap5',
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    selectable: true,
    editable: true,
    select: info => {
      isAllDay = info.allDay;
      openModal(info.startStr, info.endStr);
    },
    eventClick: info => {
      selectedEvent = info.event;
      isAllDay = info.event.allDay;
      openModal(
        info.event.startStr,
        info.event.endStr,
        info.event.title,
        info.event.extendedProps.description || '',
        info.event.backgroundColor || '#3788d8'
      );
    },
    events: loadEvents()
  });

  calendar.render();

  function openModal(start, end, title = '', desc = '', color = '#3788d8') {
    titleInput.value = title;
    startInput.value = start.substring(0, 16);
    endInput.value = end ? end.substring(0, 16) : start.substring(0, 16);
    descInput.value = desc;
    colorInput.value = color;
    modal.show();
  }

  function resetForm() {
    titleInput.value = '';
    startInput.value = '';
    endInput.value = '';
    descInput.value = '';
    colorInput.value = '#3788d8';
    selectedEvent = null;
    isAllDay = false;
  }

  modalEl.addEventListener('hidden.bs.modal', resetForm);

  saveBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const start = startInput.value;
    const end = endInput.value;
    const desc = descInput.value.trim();
    const color = colorInput.value;

    if (!title || !start) return;

    if (selectedEvent) {
      selectedEvent.setProp('title', title);
      selectedEvent.setStart(start);
      selectedEvent.setEnd(end);
      selectedEvent.setAllDay(isAllDay);
      selectedEvent.setExtendedProp('description', desc);
      selectedEvent.setProp('backgroundColor', color);
      selectedEvent.setProp('borderColor', color);
      updateEvent(selectedEvent);
    } else {
      const newEvent = calendar.addEvent({
        title,
        start,
        end,
        allDay: isAllDay,
        description: desc,
        backgroundColor: color,
        borderColor: color
      });
      persistEvent(newEvent);
    }
    modal.hide();
  });

  deleteBtn.addEventListener('click', () => {
    if (selectedEvent) {
      selectedEvent.remove();
      removeEvent(selectedEvent);
      modal.hide();
    }
  });

  function loadEvents() {
    try {
      return JSON.parse(localStorage.getItem('calendarEvents') || '[]').map(e => ({
        ...e,
        backgroundColor: e.color,
        borderColor: e.color
      }));
    } catch {
      return [];
    }
  }

  function persistEvent(event) {
    const events = loadEvents();
    events.push({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay,
      description: event.extendedProps.description || '',
      color: event.backgroundColor
    });
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }

  function updateEvent(event) {
    const events = loadEvents().map(e =>
      e.id === event.id
        ? {
            id: event.id,
            title: event.title,
            start: event.startStr,
            end: event.endStr,
            allDay: event.allDay,
            description: event.extendedProps.description || '',
            color: event.backgroundColor
          }
        : e
    );
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }

  function removeEvent(event) {
    const events = loadEvents().filter(e => e.id !== event.id);
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }
});
