import { loadCourses, saveCourses, persistEvent, updateEvent } from './storage.js';
import { createRecurringEvents } from './recurrence.js';
import { recalcTravelEvents } from './reminders.js';
import { loadProfile } from './profile.js';
import { suggestStudySessions } from './study.js';

function nextDate(day) {
  const now = new Date();
  const diff = (day + 7 - now.getDay()) % 7;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  return d;
}

function combineDateTime(date, time) {
  const [h, m] = time.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m)
    .toISOString()
    .substring(0, 16);
}

export function createCourse(course, calendar, persist = persistEvent) {
  course.id = course.id || 'course-' + Date.now();
  course.meetings.forEach(meeting => {
    meeting.eventIds = [];
    const first = nextDate(meeting.day);
    const base = {
      title: `${course.name} ${meeting.type}`,
      start: combineDateTime(first, meeting.start),
      end: combineDateTime(first, meeting.end),
      allDay: false,
      extendedProps: {
        location: meeting.locationType === 'physical' ? meeting.location : '',
        onlineLink: meeting.locationType === 'online' ? meeting.location : '',
        lat:
          meeting.locationType === 'physical' && meeting.lat != null
            ? meeting.lat
            : '',
        lng:
          meeting.locationType === 'physical' && meeting.lng != null
            ? meeting.lng
            : '',
        reminders: meeting.reminders,
        calendar: 'Study'
      },
      backgroundColor: course.color,
      borderColor: course.color
    };
    const ev = calendar.addEvent(base);
    persist(ev);
    meeting.eventIds.push(ev.id);
    createRecurringEvents(base, 'weekly', meeting.weeks - 1).forEach(data => {
      data.extendedProps = { ...base.extendedProps };
      const e = calendar.addEvent(data);
      persist(e);
      meeting.eventIds.push(e.id);
    });
  });
  course.assignments = course.assignments || [];
  course.assignments.forEach(a => {
    const ev = calendar.addEvent({
      title: `${course.name}: ${a.title}`,
      start: a.due,
      end: a.due,
      allDay: false,
      extendedProps: {
        description: a.chapters || '',
        onlineLink: a.link || '',
        calendar: 'Study'
      },
      backgroundColor: course.color,
      borderColor: course.color
    });
    persist(ev);
    a.eventId = ev.id;
    suggestStudySessions(a, course, calendar, persist);
  });
  return course;
}

export function addAssignment(course, assignment, calendar, persist = persistEvent) {
  if (!course.assignments) course.assignments = [];
  const ev = calendar.addEvent({
    title: `${course.name}: ${assignment.title}`,
    start: assignment.due,
    end: assignment.due,
    allDay: false,
    extendedProps: {
      description: assignment.chapters || '',
      onlineLink: assignment.link || '',
      calendar: 'Study'
    },
    backgroundColor: course.color,
    borderColor: course.color
  });
  persist(ev);
  assignment.eventId = ev.id;
  course.assignments.push(assignment);
  suggestStudySessions(assignment, course, calendar, persist);
  return assignment;
}

export function updateMeetingLocation(
  course,
  meetingIndex,
  newLoc,
  fromDate,
  calendar,
  update = updateEvent
) {
  const meeting = course.meetings[meetingIndex];
  Object.assign(meeting, newLoc);
  meeting.eventIds.forEach(id => {
    const ev = calendar.getEventById(id);
    if (ev && ev.start.getTime() >= fromDate.getTime()) {
      if (meeting.locationType === 'online') {
        ev.setExtendedProp('onlineLink', meeting.location);
        ev.setExtendedProp('location', '');
      } else {
        ev.setExtendedProp('location', meeting.location);
        ev.setExtendedProp('onlineLink', '');
      }
      update(ev);
    }
  });
}

export function setupCourseSettings(calendar) {
  const courseCards = document.getElementById('courseCards');
  const addCourseBtn = document.getElementById('addCourse');
  const courseModal = document.getElementById('courseModal');
  const courseName = document.getElementById('courseName');
  const courseCode = document.getElementById('courseCode');
  const courseSemester = document.getElementById('courseSemester');
  const courseColor = document.getElementById('courseColor');
  const meetingsContainer = document.getElementById('meetingsContainer');
  const addMeetingBtn = document.getElementById('addMeeting');
  const assignmentsContainer = document.getElementById('assignmentsContainer');
  const addAssignmentBtn = document.getElementById('addAssignment');
  const topicsContainer = document.getElementById('topicsContainer');
  const addTopicBtn = document.getElementById('addTopic');
  const saveCourseBtn = document.getElementById('saveCourse');
  const cancelCourseBtn = document.getElementById('cancelCourse');
  const nextStepBtn = document.getElementById('nextCourseStep');
  const prevStepBtn = document.getElementById('prevCourseStep');
  const courseSteps = courseModal.querySelectorAll('.courseStep');
  const detailModal = document.getElementById('courseDetailModal');
  const closeDetailBtn = document.getElementById('closeCourseDetail');
  const detailSections = detailModal.querySelectorAll('.courseDetailSection');
  const detailTabs = detailModal.querySelectorAll('#courseDetailTabs button');

  let courses = loadCourses();

  const renderCourses = () => {
    courseCards.innerHTML = '';
    courses.forEach((c, i) => {
      const card = document.createElement('div');
      card.className = 'courseCard';
      card.style.border = `2px solid ${c.color}`;
      card.innerHTML = `<strong>${c.name}</strong> (${c.code})<br/>Meetings: ${c.meetings.length} | Assignments: ${(c.assignments || []).length}`;
      card.addEventListener('click', () => openCourseDetail(c));
      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.addEventListener('click', e => {
        e.stopPropagation();
        courses.splice(i, 1);
        saveCourses(courses);
        renderCourses();
      });
      card.appendChild(del);
      courseCards.appendChild(card);
    });
  };

  const addMeetingRow = () => {
    const div = document.createElement('div');
    div.className = 'meeting';
    div.innerHTML = `<select class="meetingType"><option>Lecture</option><option>Practice</option><option>Lab</option></select>
<select class="meetingDay"><option value="0">Sun</option><option value="1">Mon</option><option value="2">Tue</option><option value="3">Wed</option><option value="4">Thu</option><option value="5">Fri</option><option value="6">Sat</option></select>
<input type="time" class="meetingStart" />
<input type="time" class="meetingEnd" />
<select class="meetingLocType"><option value="physical">Physical</option><option value="online">Online</option></select>
<input type="text" class="meetingLocation" placeholder="Location or Link" />
<input type="text" class="meetingReminders" placeholder="Reminders (min)" />`;
    meetingsContainer.appendChild(div);
  };

  const addAssignmentRow = () => {
    const div = document.createElement('div');
    div.className = 'assignment';
    div.innerHTML = `<input type="text" class="assignTitle" placeholder="Title" />
<input type="datetime-local" class="assignDue" />
<input type="url" class="assignLink" placeholder="Link" />
<input type="text" class="assignChapters" placeholder="Chapters" />`;
    assignmentsContainer.appendChild(div);
  };

  const addTopicRow = () => {
    const div = document.createElement('div');
    div.className = 'topic';
    div.innerHTML = `<input type="text" class="topicName" placeholder="Topic" />`;
    topicsContainer.appendChild(div);
  };

  const openCourseDetail = course => {
    detailSections.forEach(sec => {
      const section = sec.dataset.section;
      if (section === 'details') {
        sec.innerHTML = `${course.name} (${course.code}) - Semester ${course.semester}`;
      } else if (section === 'meetings') {
        sec.innerHTML = course.meetings
          .map(m => `<div>${m.type} day ${m.day} ${m.start}-${m.end}</div>`)
          .join('');
      } else if (section === 'assignments') {
        sec.innerHTML = (course.assignments || [])
          .map(a => `<div>${a.title} ${a.due}</div>`)
          .join('');
      } else if (section === 'topics') {
        sec.innerHTML = (course.topics || [])
          .map(t => `<div>${t}</div>`)
          .join('');
      } else {
        sec.innerHTML = '';
      }
    });
    showDetailSection('details');
    detailModal.style.display = 'flex';
  };

  function showDetailSection(name) {
    detailSections.forEach(sec => {
      sec.style.display = sec.dataset.section === name ? 'block' : 'none';
    });
  }

  detailTabs.forEach(btn =>
    btn.addEventListener('click', () => showDetailSection(btn.dataset.section))
  );
  closeDetailBtn.addEventListener('click', () => {
    detailModal.style.display = 'none';
  });

  let currentStep = 0;

  const showStep = i => {
    courseSteps.forEach((step, idx) => {
      step.style.display = idx === i ? 'block' : 'none';
    });
    prevStepBtn.style.display = i === 0 ? 'none' : 'inline';
    nextStepBtn.style.display = i === courseSteps.length - 1 ? 'none' : 'inline';
    saveCourseBtn.style.display = i === courseSteps.length - 1 ? 'inline' : 'none';
  };

  const openModal = () => {
    courseName.value = '';
    courseCode.value = '';
    courseSemester.value = 'A';
    courseColor.value = '#3788d8';
    meetingsContainer.innerHTML = '';
    assignmentsContainer.innerHTML = '';
    topicsContainer.innerHTML = '';
    addMeetingRow();
    currentStep = 0;
    showStep(currentStep);
    courseModal.style.display = 'flex';
  };

  const closeModal = () => {
    courseModal.style.display = 'none';
  };

  addCourseBtn.addEventListener('click', openModal);
  cancelCourseBtn.addEventListener('click', closeModal);
  addMeetingBtn.addEventListener('click', addMeetingRow);
  addAssignmentBtn.addEventListener('click', addAssignmentRow);
  addTopicBtn.addEventListener('click', addTopicRow);
  nextStepBtn.addEventListener('click', () => {
    if (currentStep < courseSteps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });
  prevStepBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  saveCourseBtn.addEventListener('click', () => {
    const course = {
      name: courseName.value.trim(),
      code: courseCode.value.trim(),
      semester: courseSemester.value,
      color: courseColor.value,
      meetings: Array.from(meetingsContainer.querySelectorAll('.meeting')).map(div => ({
        type: div.querySelector('.meetingType').value,
        day: parseInt(div.querySelector('.meetingDay').value, 10),
        start: div.querySelector('.meetingStart').value,
        end: div.querySelector('.meetingEnd').value,
        locationType: div.querySelector('.meetingLocType').value,
        location: div.querySelector('.meetingLocation').value,
        reminders: div
          .querySelector('.meetingReminders')
          .value.split(',')
          .map(s => parseInt(s.trim(), 10))
          .filter(n => !isNaN(n)),
        weeks: 13,
        eventIds: []
      })),
      assignments: Array.from(assignmentsContainer.querySelectorAll('.assignment')).map(div => ({
        title: div.querySelector('.assignTitle').value,
        due: div.querySelector('.assignDue').value,
        link: div.querySelector('.assignLink').value,
        chapters: div.querySelector('.assignChapters').value
      })),
      topics: Array.from(topicsContainer.querySelectorAll('.topicName'))
        .map(i => i.value.trim())
        .filter(Boolean)
    };
    createCourse(course, calendar, persistEvent);
    courses.push(course);
    saveCourses(courses);
    recalcTravelEvents(calendar, persistEvent, updateEvent, false, loadProfile());
    renderCourses();
    closeModal();
  });

  renderCourses();
}
