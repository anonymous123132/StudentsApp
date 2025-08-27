export function createCourse({
  id = `course-${Date.now()}`,
  name = '',
  code = '',
  semester = '',
  color = '#000000',
  defaultLocation = { type: 'online' },
  meetings = []
} = {}) {
  return { id, name, code, semester, color, defaultLocation, meetings };
}

export function createMeeting({
  id = `meeting-${Date.now()}`,
  courseId = '',
  kind = 'lecture',
  dayOfWeek = 0,
  startTime = '00:00',
  endTime = '00:00',
  frequency = 'weekly',
  weeksPattern = [],
  exceptions = [],
  location = { type: 'online' },
  defaultReminders = []
} = {}) {
  return {
    id,
    courseId,
    kind,
    dayOfWeek,
    startTime,
    endTime,
    frequency,
    weeksPattern,
    exceptions,
    location,
    defaultReminders
  };
}

export function createChapterRange({
  source = 'book',
  from = '',
  to = undefined
} = {}) {
  const range = { source, from };
  if (to != null) range.to = to;
  return range;
}

export function createTask({
  id = `task-${Date.now()}`,
  courseId = undefined,
  type = 'homework',
  title = '',
  due = '',
  link = undefined,
  chapters = [],
  topics = [],
  effortEstimateMin = undefined,
  progress = 0,
  subtasks = [],
  includeInStudy = false
} = {}) {
  const task = {
    id,
    courseId,
    type,
    title,
    due,
    chapters,
    topics,
    progress,
    subtasks,
    includeInStudy
  };
  if (link) task.link = link;
  if (effortEstimateMin != null) task.effortEstimateMin = effortEstimateMin;
  return task;
}

export function createSubtask({
  id = `subtask-${Date.now()}`,
  title = '',
  estMin = undefined,
  done = false
} = {}) {
  const sub = { id, title, done };
  if (estMin != null) sub.estMin = estMin;
  return sub;
}

export function createWorkProfile({
  id = `work-${Date.now()}`,
  name = '',
  address = undefined,
  defaultMode = 'physical',
  lat = undefined,
  lng = undefined,
  tasks = [],
  shifts = []
} = {}) {
  const profile = { id, name, defaultMode, tasks, shifts };
  if (address) profile.address = address;
  if (lat != null) profile.lat = lat;
  if (lng != null) profile.lng = lng;
  return profile;
}

export function createWorkShift({
  id = `shift-${Date.now()}`,
  workProfileId = '',
  dayOfWeek = 0,
  startTime = '00:00',
  endTime = '00:00',
  frequency = 'weekly',
  exceptions = [],
  mode = 'physical'
} = {}) {
  return {
    id,
    workProfileId,
    dayOfWeek,
    startTime,
    endTime,
    frequency,
    exceptions,
    mode
  };
}

export function updateTaskProgress(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    task.progress = task.progress || 0;
    return task.progress;
  }
  const total = task.subtasks.reduce((sum, s) => sum + (s.estMin || 1), 0);
  const done = task.subtasks.reduce(
    (sum, s) => sum + (s.done ? (s.estMin || 1) : 0),
    0
  );
  task.progress = total === 0 ? 0 : done / total;
  return task.progress;
}

export function createUserProfile({
  homeAddress = 'Home',
  travelMode = 'transit',
  bufferMinutes = 10,
  travelProvider = 'google'
} = {}) {
  return { homeAddress, travelMode, bufferMinutes, travelProvider };
}

export function createTravelPolicy({
  addAs = 'event',
  roundTrip = false
} = {}) {
  return { addAs, roundTrip };
}
