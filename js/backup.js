export function getBackupData() {
  return {
    events: JSON.parse(localStorage.getItem('calendarEvents') || '[]'),
    categories: JSON.parse(localStorage.getItem('eventCategories') || '[]'),
    dndMode: JSON.parse(localStorage.getItem('dndMode') || 'false'),
    appLockPin: localStorage.getItem('appLockPin') || ''
  };
}

export function downloadBackup() {
  const blob = new Blob([JSON.stringify(getBackupData())], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function restoreBackup(text) {
  const data = JSON.parse(text);
  localStorage.setItem('calendarEvents', JSON.stringify(data.events || []));
  localStorage.setItem('eventCategories', JSON.stringify(data.categories || []));
  localStorage.setItem('dndMode', JSON.stringify(data.dndMode || false));
  if (data.appLockPin) localStorage.setItem('appLockPin', data.appLockPin);
  else localStorage.removeItem('appLockPin');
}

export function importBackup(file, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    restoreBackup(e.target.result);
    if (callback) callback();
  };
  reader.readAsText(file);
}
