import fs from 'fs';
import path from 'path';

// ensure main page includes required containers so app can bootstrap
// this confirms the page structure loads correctly

test('index.html has core elements', () => {
  const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  expect(doc.getElementById('calendar')).not.toBeNull();
  expect(doc.getElementById('eventModal')).not.toBeNull();
  expect(doc.getElementById('settingsModal')).not.toBeNull();
});
