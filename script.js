import { createCourse, createTask, createSubtask } from './js/models.js';
import { loadCourses, saveCourses, loadTasks, saveTasks } from './js/storage.js';
import { quickAddStudy, suggestStudySessions } from './js/study.js';

document.addEventListener('DOMContentLoaded', () => {
  // Original calendar elements
  const calendarEl = document.getElementById('calendar');
  const modal = document.getElementById('eventModal');
  const titleInput = document.getElementById('eventTitle');
  const startInput = document.getElementById('eventStart');
  const endInput = document.getElementById('eventEnd');
  const descInput = document.getElementById('eventDesc');
  const colorInput = document.getElementById('eventColor');
  const saveBtn = document.getElementById('saveEvent');
  const cancelBtn = document.getElementById('cancelEvent');
  const deleteBtn = document.getElementById('deleteEvent');

  // New StudentsApp elements
  const quickStudyBtn = document.getElementById('quickStudyBtn');
  const addCourseBtn = document.getElementById('addCourseBtn');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const viewCoursesBtn = document.getElementById('viewCoursesBtn');
  
  // Course modal
  const courseModal = document.getElementById('courseModal');
  const courseNameInput = document.getElementById('courseName');
  const courseCodeInput = document.getElementById('courseCode');
  const courseSemesterInput = document.getElementById('courseSemester');
  const courseColorInput = document.getElementById('courseColor');
  const saveCourseBtn = document.getElementById('saveCourse');
  const cancelCourseBtn = document.getElementById('cancelCourse');
  
  // Task modal
  const taskModal = document.getElementById('taskModal');
  const taskTitleInput = document.getElementById('taskTitle');
  const taskTypeSelect = document.getElementById('taskType');
  const taskDueInput = document.getElementById('taskDue');
  const taskEffortInput = document.getElementById('taskEffort');
  const taskIncludeStudyInput = document.getElementById('taskIncludeStudy');
  const saveTaskBtn = document.getElementById('saveTask');
  const cancelTaskBtn = document.getElementById('cancelTask');
  
  // Courses list modal
  const coursesModal = document.getElementById('coursesModal');
  const coursesListDiv = document.getElementById('coursesList');
  const closeCoursesBtn = document.getElementById('closeCourses');

  let selectedEvent = null;
  let selectedCourse = null;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    selectable: true,
    editable: true,
    select: info => openModal(info.startStr, info.endStr),
    eventClick: info => {
      selectedEvent = info.event;
      openModal(
        info.event.startStr,
        info.event.endStr,
        info.event.title,
        info.event.extendedProps.description || '',
        info.event.backgroundColor || '#3788d8'
      );
    },
    events: loadAllEvents()
  });

  calendar.render();

  // Original modal functions
  function openModal(start, end, title = '', desc = '', color = '#3788d8') {
    titleInput.value = title;
    startInput.value = start.substring(0, 16);
    endInput.value = end ? end.substring(0, 16) : start.substring(0, 16);
    descInput.value = desc;
    colorInput.value = color;
    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
    titleInput.value = '';
    startInput.value = '';
    endInput.value = '';
    descInput.value = '';
    colorInput.value = '#3788d8';
    selectedEvent = null;
  }

  // Enhanced event loading that combines original events with course/task events
  function loadAllEvents() {
    const originalEvents = loadEvents();
    const courseEvents = generateCourseEvents();
    const taskEvents = generateTaskEvents();
    return [...originalEvents, ...courseEvents, ...taskEvents];
  }

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

  function generateCourseEvents() {
    const courses = loadCourses();
    const events = [];
    // This would generate recurring meeting events based on course meetings
    // For now, just return empty array
    return events;
  }

  function generateTaskEvents() {
    const tasks = loadTasks();
    return tasks.map(task => ({
      id: `task-${task.id}`,
      title: `📚 ${task.title}`,
      start: task.due,
      allDay: true,
      backgroundColor: '#e74c3c',
      borderColor: '#c0392b',
      extendedProps: {
        isTask: true,
        taskData: task
      }
    }));
  }

  // Original event persistence functions
  function persistEvent(event) {
    const events = loadEvents();
    events.push({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
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

  // Original event handlers
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
      selectedEvent.setExtendedProp('description', desc);
      selectedEvent.setProp('backgroundColor', color);
      selectedEvent.setProp('borderColor', color);
      updateEvent(selectedEvent);
    } else {
      const newEvent = calendar.addEvent({
        title,
        start,
        end,
        description: desc,
        backgroundColor: color,
        borderColor: color
      });
      persistEvent(newEvent);
    }
    closeModal();
  });

  cancelBtn.addEventListener('click', closeModal);

  deleteBtn.addEventListener('click', () => {
    if (selectedEvent) {
      selectedEvent.remove();
      removeEvent(selectedEvent);
      closeModal();
    }
  });

  // New StudentsApp functionality

  // Quick Study button
  quickStudyBtn.addEventListener('click', () => {
    const studyEvents = quickAddStudy(calendar, persistStudyEvent);
    if (studyEvents.length > 0) {
      alert(`Added ${studyEvents.length} study blocks to your calendar!`);
    } else {
      alert('No study blocks could be scheduled. Try adding some tasks first!');
    }
  });

  function persistStudyEvent(event) {
    // Study events are handled separately from regular events
    // They could be stored in localStorage with a different key
    const studyEvents = JSON.parse(localStorage.getItem('studyEvents') || '[]');
    studyEvents.push({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      extendedProps: event.extendedProps
    });
    localStorage.setItem('studyEvents', JSON.stringify(studyEvents));
  }

  // Course management
  addCourseBtn.addEventListener('click', () => {
    courseModal.style.display = 'flex';
  });

  cancelCourseBtn.addEventListener('click', () => {
    courseModal.style.display = 'none';
    clearCourseForm();
  });

  saveCourseBtn.addEventListener('click', () => {
    const name = courseNameInput.value.trim();
    const code = courseCodeInput.value.trim();
    const semester = courseSemesterInput.value.trim();
    const color = courseColorInput.value;

    if (!name) {
      alert('Please enter a course name');
      return;
    }

    const course = createCourse({ name, code, semester, color });
    const courses = loadCourses();
    courses.push(course);
    saveCourses(courses);

    courseModal.style.display = 'none';
    clearCourseForm();
    alert('Course added successfully!');
  });

  function clearCourseForm() {
    courseNameInput.value = '';
    courseCodeInput.value = '';
    courseSemesterInput.value = '';
    courseColorInput.value = '#3788d8';
  }

  // Task management
  addTaskBtn.addEventListener('click', () => {
    taskModal.style.display = 'flex';
  });

  cancelTaskBtn.addEventListener('click', () => {
    taskModal.style.display = 'none';
    clearTaskForm();
  });

  saveTaskBtn.addEventListener('click', () => {
    const title = taskTitleInput.value.trim();
    const type = taskTypeSelect.value;
    const due = taskDueInput.value;
    const effort = parseInt(taskEffortInput.value) || undefined;
    const includeInStudy = taskIncludeStudyInput.checked;

    if (!title || !due) {
      alert('Please enter a title and due date');
      return;
    }

    const task = createTask({
      title,
      type,
      due,
      effortEstimateMin: effort,
      includeInStudy
    });

    const tasks = loadTasks();
    tasks.push(task);
    saveTasks(tasks);

    // Add to calendar
    calendar.addEvent({
      id: `task-${task.id}`,
      title: `📚 ${task.title}`,
      start: task.due,
      allDay: true,
      backgroundColor: '#e74c3c',
      borderColor: '#c0392b',
      extendedProps: {
        isTask: true,
        taskData: task
      }
    });

    taskModal.style.display = 'none';
    clearTaskForm();
    alert('Task added successfully!');
  });

  function clearTaskForm() {
    taskTitleInput.value = '';
    taskTypeSelect.value = 'homework';
    taskDueInput.value = '';
    taskEffortInput.value = '';
    taskIncludeStudyInput.checked = false;
  }

  // View courses and tasks
  viewCoursesBtn.addEventListener('click', () => {
    displayCoursesAndTasks();
    coursesModal.style.display = 'flex';
  });

  closeCoursesBtn.addEventListener('click', () => {
    coursesModal.style.display = 'none';
  });

  function displayCoursesAndTasks() {
    const courses = loadCourses();
    const tasks = loadTasks();
    
    let html = '<h4>Courses</h4>';
    if (courses.length === 0) {
      html += '<p>No courses added yet.</p>';
    } else {
      html += '<ul>';
      courses.forEach(course => {
        html += `<li style="color: ${course.color}">
          <strong>${course.name} (${course.code})</strong> - ${course.semester}
        </li>`;
      });
      html += '</ul>';
    }

    html += '<h4>Tasks</h4>';
    if (tasks.length === 0) {
      html += '<p>No tasks added yet.</p>';
    } else {
      html += '<ul>';
      tasks.forEach(task => {
        const dueDate = new Date(task.due).toLocaleDateString();
        html += `<li>
          <strong>${task.title}</strong> (${task.type}) - Due: ${dueDate}
          ${task.includeInStudy ? ' 🎯' : ''}
        </li>`;
      });
      html += '</ul>';
    }

    coursesListDiv.innerHTML = html;
  }

  // Initialize - load any existing data
  const existingCourses = loadCourses();
  const existingTasks = loadTasks();
  
  // Add task events to calendar on load
  existingTasks.forEach(task => {
    calendar.addEvent({
      id: `task-${task.id}`,
      title: `📚 ${task.title}`,
      start: task.due,
      allDay: true,
      backgroundColor: '#e74c3c',
      borderColor: '#c0392b',
      extendedProps: {
        isTask: true,
        taskData: task
      }
    });
  });
});
