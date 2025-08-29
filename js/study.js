import { loadCourses, loadWorkProfiles } from './storage.js';
import { hasConflict } from './conflicts.js';
import { updateTaskProgress } from './models.js';

export function suggestStudySessions(assignment, course, calendar, persistEvent) {
  const due = new Date(assignment.due);
  if (isNaN(due)) return [];
  const startWindow = new Date(due.getTime() - 72 * 60 * 60 * 1000);
  const endWindow = new Date(due.getTime() - 24 * 60 * 60 * 1000);
  if (endWindow <= startWindow) return [];
  const sessions = [];
  const interval = (endWindow.getTime() - startWindow.getTime()) / 3;
  for (let i = 0; i < 3; i++) {
    const start = new Date(startWindow.getTime() + i * interval);
    const end = new Date(start.getTime() + 45 * 60000);
    const data = {
      title: `Study: ${course.name} ${assignment.title}`,
      start: start.toISOString().substring(0, 16),
      end: end.toISOString().substring(0, 16),
      allDay: false,
      extendedProps: { isStudy: true, calendar: 'Study' },
      backgroundColor: course.color,
      borderColor: course.color
    };
    const ev = calendar.addEvent(data);
    persistEvent(ev);
    sessions.push(ev);
  }
  return sessions;
}

export function quickAddStudy(
  calendar,
  persistEvent,
  { maxBlocks = 3, maxPerDay = 2, minGap = 30 } = {},
) {
  const courses = loadCourses();
  const workProfiles = loadWorkProfiles();
  const now = new Date();
  const endWindow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const assignments = [];
  courses.forEach(course => {
    (course.assignments || []).forEach(a => {
      const due = new Date(a.due);
      if (!isNaN(due) && due > now) {
        assignments.push({ course, assignment: a, due, color: course.color });
      }
    });
  });
  workProfiles.forEach(p => {
    (p.tasks || []).forEach(t => {
      const due = new Date(t.due);
      if (!isNaN(due) && due > now && t.includeInStudy) {
        assignments.push({ course: null, assignment: t, due, color: '#888' });
      }
    });
  });
  assignments.sort((a, b) => a.due - b.due);
  const created = [];
  for (const { course, assignment, color } of assignments) {
    updateTaskProgress(assignment);
    let remaining = calcRemaining(assignment);
    while (remaining > 0 && created.length < maxBlocks) {
      const slot = findSlot(
        calendar,
        now,
        endWindow,
        minGap,
        maxPerDay,
        created
      );
      if (!slot) return created;
      const start = slot;
      const end = new Date(start.getTime() + 50 * 60000);
      const ev = calendar.addEvent({
        title: course
          ? `Study — ${course.name} ${assignment.title}`
          : `Study — ${assignment.title}`,
        start: start.toISOString().substring(0, 16),
        end: end.toISOString().substring(0, 16),
        allDay: false,
        extendedProps: {
          isStudy: true,
          calendar: 'Study',
          category: 'Focus',
          description: assignment.chapters || ''
        },
        backgroundColor: color,
        borderColor: color
      });
      persistEvent(ev);
      created.push(ev);
      remaining -= 50;
    }
    if (created.length >= maxBlocks) break;
  }
  return created;
}

function findSlot(calendar, from, to, minGap, maxPerDay, existing) {
  for (
    let day = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    day < to;
    day.setDate(day.getDate() + 1)
  ) {
    const dayEvents = existing.filter(e => sameDay(e.start, day));
    if (dayEvents.length >= maxPerDay) continue;
    for (let h = 8; h <= 20; h++) {
      for (const m of [0, 30]) {
        const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
        if (start < from) continue;
        const end = new Date(start.getTime() + 50 * 60000);
        const bufferedStart = new Date(start.getTime() - minGap * 60000);
        const bufferedEnd = new Date(end.getTime() + minGap * 60000);
        if (bufferedEnd > to) continue;
        if (!hasConflict(calendar, bufferedStart, bufferedEnd)) {
          return start;
        }
      }
    }
  }
  return null;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function calcRemaining(task) {
  let total = task.effortEstimateMin;
  if (task.subtasks && task.subtasks.length) {
    const estSum = task.subtasks.reduce(
      (sum, s) => sum + (s.estMin || 0),
      0
    );
    if (total == null) total = estSum || task.subtasks.length * 25;
    const done = task.subtasks.reduce(
      (sum, s) => sum + (s.done ? (s.estMin || 0) : 0),
      0
    );
    return Math.max(total - done, 0);
  }
  if (total == null) total = 50;
  const progress = task.progress || 0;
  return Math.max(total * (1 - progress), 0);
}
