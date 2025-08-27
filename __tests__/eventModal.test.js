import { jest } from '@jest/globals';
import { setupEventModal } from '../js/eventModal.js';

describe('eventModal', () => {
  test('openForCreate shows modal and adds participant', () => {
    document.body.innerHTML = `
      <div id="eventModal" style="display:none;">
        <input id="eventTitle" />
        <input id="eventStart" />
        <input id="eventEnd" />
        <input type="checkbox" id="eventAllDay" />
        <textarea id="eventDesc"></textarea>
        <select id="eventDestination"></select>
        <input id="eventLocation" />
        <a id="eventMapLink"></a>
        <input id="eventLat" />
        <input id="eventLng" />
        <input type="checkbox" id="smartTravel" />
        <input id="eventOnlineLink" />
        <input id="eventAttachments" />
        <select id="eventTimeZone"></select>
        <ul id="participantsList"></ul>
        <button id="addParticipant"></button>
        <input id="eventReminders" />
        <select id="eventCategory"></select>
        <select id="eventRecurrence"><option value="none">none</option></select>
        <input id="eventColor" />
        <select id="eventCalendar"><option value="Personal">Personal</option></select>
        <button id="saveEvent"></button>
        <button id="cancelEvent"></button>
        <button id="deleteEvent"></button>
      </div>`;

    const calendar = { addEvent: jest.fn(), getEvents: () => [] };
    const { openForCreate } = setupEventModal(calendar, () => false, () => {});
    openForCreate({ startStr: '2024-01-01T10:00', endStr: '2024-01-01T11:00', allDay: false });
    expect(document.getElementById('eventModal').style.display).toBe('flex');
    document.getElementById('addParticipant').click();
    expect(document.querySelectorAll('#participantsList li')).toHaveLength(1);
  });
});
