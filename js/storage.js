// Storage utilities for StudentsApp

export function loadCourses() {
  try {
    return JSON.parse(localStorage.getItem('studentsapp-courses') || '[]');
  } catch {
    return [];
  }
}

export function saveCourses(courses) {
  localStorage.setItem('studentsapp-courses', JSON.stringify(courses));
}

export function loadWorkProfiles() {
  try {
    return JSON.parse(localStorage.getItem('studentsapp-workprofiles') || '[]');
  } catch {
    return [];
  }
}

export function saveWorkProfiles(profiles) {
  localStorage.setItem('studentsapp-workprofiles', JSON.stringify(profiles));
}

export function loadUserProfile() {
  try {
    return JSON.parse(localStorage.getItem('studentsapp-userprofile') || '{}');
  } catch {
    return {};
  }
}

export function saveUserProfile(profile) {
  localStorage.setItem('studentsapp-userprofile', JSON.stringify(profile));
}

export function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem('studentsapp-tasks') || '[]');
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  localStorage.setItem('studentsapp-tasks', JSON.stringify(tasks));
}