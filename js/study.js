import { loadCourses, loadWorkProfiles } from './storage.js';
import { updateTaskProgress } from './models.js';

export function suggestStudySessions(assignment, course, calendar, persistEvent) {
  const sessions = [];
  const remaining = calcRemaining(assignment);
  const sessionCount = Math.min(3, Math.ceil(remaining / 50));
  
  for (let i = 0; i < sessionCount; i++) {
    const sessionLength = Math.min(50, remaining - i * 50);
    if (sessionLength <= 0) break;
    
    const data = {
      title: `Study — ${course.name} ${assignment.title}`,
      start: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
      end: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000 + sessionLength * 60 * 1000).toISOString().substring(0, 16),
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
  // Simple time slot finder - could be enhanced with more sophisticated logic
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM
  
  for (let d = new Date(from); d < to; d.setDate(d.getDate() + 1)) {
    const sameDay = existing.filter(e => sameDay(new Date(e.start), d));
    if (sameDay.length >= maxPerDay) continue;
    
    for (let h = startHour; h < endHour; h++) {
      const slot = new Date(d);
      slot.setHours(h, 0, 0, 0);
      
      // Check for conflicts with existing events
      const conflicts = calendar.getEvents().filter(e => {
        const eventStart = new Date(e.start);
        const eventEnd = new Date(e.end);
        const slotEnd = new Date(slot.getTime() + 50 * 60000);
        
        return (slot < eventEnd && slotEnd > eventStart);
      });
      
      if (conflicts.length === 0) {
        return slot;
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