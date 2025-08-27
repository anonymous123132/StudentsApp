import { addParticipantRow, renderParticipants, getParticipants } from './participants.js';
import { scheduleReminders, clearReminders, recalcTravelEvents } from './reminders.js';
import { persistEvent, updateEvent, removeEvent } from './storage.js';
import { loadProfile } from './profile.js';
import { hasConflict } from './conflicts.js';
import { createRecurringEvents } from './recurrence.js';
import { getMapLink } from './utils.js';

export function setupEventModal(calendar, getDnd, applyFilters) {
  const modal = document.getElementById('eventModal');
  const titleInput = document.getElementById('eventTitle');
  const startInput = document.getElementById('eventStart');
  const endInput = document.getElementById('eventEnd');
  const allDayCheckbox = document.getElementById('eventAllDay');
  const descInput = document.getElementById('eventDesc');
  const locationInput = document.getElementById('eventLocation');
  const latInput = document.getElementById('eventLat');
  const lngInput = document.getElementById('eventLng');
  const destinationSelect = document.getElementById('eventDestination');
  const mapAnchor = document.getElementById('eventMapLink');
  const smartTravelCheckbox = document.getElementById('smartTravel');
  const onlineLinkInput = document.getElementById('eventOnlineLink');
  const attachmentsInput = document.getElementById('eventAttachments');
  const timezoneSelect = document.getElementById('eventTimeZone');
  const participantsList = document.getElementById('participantsList');
  const addParticipantBtn = document.getElementById('addParticipant');
  const reminderInput = document.getElementById('eventReminders');
  const categoryInput = document.getElementById('eventCategory');
  const recurrenceSelect = document.getElementById('eventRecurrence');
  const colorInput = document.getElementById('eventColor');
  const calendarSelect = document.getElementById('eventCalendar');
  const saveBtn = document.getElementById('saveEvent');
  const cancelBtn = document.getElementById('cancelEvent');
  const deleteBtn = document.getElementById('deleteEvent');

  let selectedEvent = null;

  addParticipantBtn.addEventListener('click', () =>
    addParticipantRow(participantsList)
  );

  function populateDestinations() {
    const profile = loadProfile();
    destinationSelect.innerHTML = '<option value=""></option>';
    (profile.destinations || []).forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.name;
      opt.textContent = d.name;
      opt.dataset.lat = d.lat;
      opt.dataset.lng = d.lng;
      destinationSelect.appendChild(opt);
    });
  }

  destinationSelect.addEventListener('change', () => {
    const opt = destinationSelect.selectedOptions[0];
    if (opt && opt.dataset.lat) {
      locationInput.value = opt.value;
      latInput.value = opt.dataset.lat;
      lngInput.value = opt.dataset.lng;
      updateMapLink();
    }
  });

  function populateTimeZones() {
    const zones = Intl.supportedValuesOf
      ? Intl.supportedValuesOf('timeZone')
      : [Intl.DateTimeFormat().resolvedOptions().timeZone];
    zones.forEach(z => {
      const opt = document.createElement('option');
      opt.value = z;
      opt.textContent = z;
      timezoneSelect.appendChild(opt);
    });
  }
  populateTimeZones();
  timezoneSelect.value = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const scheduleRemindersBound = ev => scheduleReminders(ev, getDnd());

  function openModal(
    start,
    end,
    title = '',
    desc = '',
    color = '#3788d8',
    allDay = false,
    location = '',
    lat = '',
    lng = '',
    smartTravel = false,
    onlineLink = '',
    reminders = [],
    category = '',
    recurrence = 'none',
    calendarName = 'Personal',
    attachments = [],
    participants = [],
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  ) {
    populateDestinations();
    titleInput.value = title;
    allDayCheckbox.checked = allDay;
    toggleDateTimeInputs(allDay);
    if (allDay) {
      startInput.value = start.substring(0, 10);
      const endDate = end ? new Date(end) : new Date(start);
      endInput.value = endDate.toISOString().substring(0, 10);
    } else {
      startInput.value = start.substring(0, 16);
      endInput.value = end ? end.substring(0, 16) : start.substring(0, 16);
    }
    descInput.value = desc;
    locationInput.value = location;
    latInput.value = lat;
    lngInput.value = lng;
    smartTravelCheckbox.checked = smartTravel;
    onlineLinkInput.value = onlineLink;
    attachmentsInput.value = attachments.join(', ');
    reminderInput.value = reminders.join(', ');
    categoryInput.value = category;
    recurrenceSelect.value = recurrence;
    calendarSelect.value = calendarName;
    colorInput.value = color;
    timezoneSelect.value = timeZone;
    renderParticipants(participantsList, participants);
    updateMapLink();
    modal.style.display = 'flex';
  }

  function toggleDateTimeInputs(allDay) {
    startInput.type = endInput.type = allDay ? 'date' : 'datetime-local';
  }

  function closeModal() {
    modal.style.display = 'none';
    selectedEvent = null;
  }

  saveBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    if (!title) return;
    const allDay = allDayCheckbox.checked;
    const start = allDay ? `${startInput.value}` : startInput.value;
    const end = allDay ? `${endInput.value}` : endInput.value;
    const desc = descInput.value.trim();
    const location = locationInput.value.trim();
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    const smartTravel = smartTravelCheckbox.checked;
    const onlineLink = onlineLinkInput.value.trim();
    const reminders = reminderInput.value
      .split(',')
      .map(v => parseInt(v.trim()))
      .filter(v => !isNaN(v));
    const category = categoryInput.value;
    const recurrence = recurrenceSelect.value;
    const calendarName = calendarSelect.value;
    const attachments = attachmentsInput.value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const participants = getParticipants(participantsList);
    const timeZone = timezoneSelect.value;

    const startDate = new Date(start);
    const endDate = end ? new Date(end) : startDate;
    if (
      hasConflict(
        calendar,
        startDate,
        endDate,
        selectedEvent ? selectedEvent.id : null
      )
    ) {
      alert('Event conflicts with an existing event');
      return;
    }

    const eventData = {
      title,
      start,
      end,
      allDay,
      description: desc,
      location,
      lat,
      lng,
      smartTravel,
      onlineLink,
      reminders,
      category,
      recurrence,
      calendar: calendarName,
      backgroundColor: colorInput.value,
      borderColor: colorInput.value,
      attachments,
      participants,
      timeZone
    };

    if (selectedEvent) {
      selectedEvent.setProp('title', title);
      selectedEvent.setStart(start);
      selectedEvent.setEnd(end);
      selectedEvent.setAllDay(allDay);
      selectedEvent.setExtendedProp('description', desc);
      selectedEvent.setExtendedProp('location', location);
      selectedEvent.setExtendedProp('lat', lat);
      selectedEvent.setExtendedProp('lng', lng);
      selectedEvent.setExtendedProp('smartTravel', smartTravel);
      selectedEvent.setExtendedProp('onlineLink', onlineLink);
      selectedEvent.setExtendedProp('reminders', reminders);
      selectedEvent.setExtendedProp('category', category);
      selectedEvent.setExtendedProp('recurrence', recurrence);
      selectedEvent.setExtendedProp('calendar', calendarName);
      selectedEvent.setExtendedProp('attachments', attachments);
      selectedEvent.setExtendedProp('participants', participants);
      selectedEvent.setExtendedProp('timeZone', timeZone);
      selectedEvent.setProp('backgroundColor', colorInput.value);
      selectedEvent.setProp('borderColor', colorInput.value);
      updateEvent(selectedEvent);
      clearReminders(selectedEvent.id);
      scheduleRemindersBound(selectedEvent);
    } else {
      const newEvent = calendar.addEvent(eventData);
      persistEvent(newEvent);
      scheduleRemindersBound(newEvent);
      if (recurrence !== 'none') {
        createRecurringEvents(eventData, recurrence).forEach(data => {
          const ev = calendar.addEvent(data);
          persistEvent(ev);
          scheduleRemindersBound(ev);
        });
      }
    }
    await recalcTravelEvents(
      calendar,
      persistEvent,
      updateEvent,
      getDnd(),
      loadProfile()
    );
    applyFilters();
    closeModal();
  });

  deleteBtn.addEventListener('click', async () => {
    if (selectedEvent) {
      clearReminders(selectedEvent.id);
      selectedEvent.remove();
      removeEvent(selectedEvent);
      await recalcTravelEvents(
        calendar,
        persistEvent,
        updateEvent,
        getDnd(),
        loadProfile()
      );
      applyFilters();
      closeModal();
    }
  });

  cancelBtn.addEventListener('click', closeModal);
  allDayCheckbox.addEventListener('change', e =>
    toggleDateTimeInputs(e.target.checked)
  );

  function updateMapLink() {
    const url = getMapLink(
      locationInput.value.trim(),
      parseFloat(latInput.value),
      parseFloat(lngInput.value)
    );
    if (url) {
      mapAnchor.style.display = 'inline';
      mapAnchor.href = url;
    } else {
      mapAnchor.style.display = 'none';
      mapAnchor.removeAttribute('href');
    }
  }
  locationInput.addEventListener('input', updateMapLink);
  latInput.addEventListener('input', updateMapLink);
  lngInput.addEventListener('input', updateMapLink);

  categoryInput.addEventListener('change', () => {
    const opt = categoryInput.selectedOptions[0];
    if (opt && opt.dataset.color) colorInput.value = opt.dataset.color;
    applyFilters();
  });

  function openForCreate(info) {
    selectedEvent = null;
    openModal(
      info.startStr,
      info.endStr,
      '',
      '',
      '#3788d8',
      info.allDay,
      '',
      '',
      '',
      false,
      '',
      [],
      '',
      'none',
      'Personal',
      [],
      [],
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  }

  function openForEdit(event) {
    selectedEvent = event;
    openModal(
      event.startStr,
      event.endStr,
      event.title,
      event.extendedProps.description || '',
      event.backgroundColor || '#3788d8',
      event.allDay,
      event.extendedProps.location || '',
      event.extendedProps.lat || '',
      event.extendedProps.lng || '',
      event.extendedProps.smartTravel || false,
      event.extendedProps.onlineLink || '',
      event.extendedProps.reminders || [],
      event.extendedProps.category || '',
      event.extendedProps.recurrence || 'none',
      event.extendedProps.calendar || 'Personal',
      event.extendedProps.attachments || [],
      event.extendedProps.participants || [],
      event.extendedProps.timeZone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  }

  return { openForCreate, openForEdit, categoryInput, scheduleRemindersBound };
}
