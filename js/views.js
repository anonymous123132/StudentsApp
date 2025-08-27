import { getHebrewDate } from './utils.js';

export function calendarOptions(selectCb, clickCb, events) {
  return {
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    buttonText: { listWeek: 'Agenda' },
    dayCellDidMount: info => {
      if (info.view.type === 'dayGridMonth') {
        const hebrew = getHebrewDate(info.date);
        const span = document.createElement('span');
        span.className = 'hebrew-date';
        span.textContent = hebrew;
        info.el
          .querySelector('.fc-daygrid-day-top')
          .appendChild(span);
      }
    },
    dayHeaderDidMount: info => {
      const hebrew = getHebrewDate(info.date);
      const span = document.createElement('span');
      span.className = 'hebrew-date';
      span.textContent = hebrew;
      info.el.appendChild(document.createElement('br'));
      info.el.appendChild(span);
    },
    listDayHeaderDidMount: info => {
      const hebrew = getHebrewDate(info.date);
      const span = document.createElement('span');
      span.className = 'hebrew-date';
      span.textContent = hebrew;
      info.el.appendChild(document.createElement('br'));
      info.el.appendChild(span);
    },
    selectable: true,
    editable: true,
    select: info => selectCb(info),
    eventClick: info => clickCb(info.event),
    events,
    eventDidMount: info => {
      const {
        description,
        location,
        category,
        onlineLink,
        attachments = [],
        participants = [],
        timeZone
      } = info.event.extendedProps;
      let tooltip = info.event.title;
      if (location) tooltip += `\nLocation: ${location}`;
      if (onlineLink) tooltip += `\nOnline: ${onlineLink}`;
      if (category) tooltip += `\nCategory: ${category}`;
      if (timeZone) tooltip += `\nTime Zone: ${timeZone}`;
      if (attachments.length)
        tooltip += `\nAttachments: ${attachments.join(', ')}`;
      if (participants.length)
        tooltip +=
          `\nParticipants: ` +
          participants.map(p => `${p.email} (${p.status})`).join(', ');
      if (description) tooltip += `\n${description}`;
      info.el.title = tooltip;
    }
  };
}

export function hasWeekView(opts) {
  return (
    opts.headerToolbar &&
    typeof opts.headerToolbar.end === 'string' &&
    opts.headerToolbar.end.includes('timeGridWeek')
  );
}
