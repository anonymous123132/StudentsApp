import { getBackupData, restoreBackup } from '../js/backup.js';

describe('backup', () => {
  beforeEach(() => localStorage.clear());

  test('getBackupData returns structure', () => {
    const data = getBackupData();
    expect(data).toEqual({
      events: [],
      categories: [],
      dndMode: false,
      appLockPin: ''
    });
  });

  test('restoreBackup writes data', () => {
    const json = JSON.stringify({
      events: [{ id: '1' }],
      categories: [{ name: 'Work', color: '#f00' }],
      dndMode: true,
      appLockPin: '1234'
    });
    restoreBackup(json);
    const stored = getBackupData();
    expect(stored.events).toHaveLength(1);
    expect(stored.categories[0].name).toBe('Work');
    expect(stored.dndMode).toBe(true);
    expect(stored.appLockPin).toBe('1234');
  });
});
