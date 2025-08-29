# StudentsApp

Simple student calendar built with [FullCalendar](https://fullcalendar.io/).

## Usage
Open `index.html` in a browser to view the calendar.
You can switch between month, week, day, or agenda (list) views. Use the modal dialog to
create, edit, or delete events. Each event supports a description, location, all-day
toggle, online link, attachment URLs, time zone selection, participants with RSVP status
and notes, calendar assignment (Personal/Work/Study), category selection, multiple
reminders, basic recurrence, latitude/longitude for automatic travel blocks, and color
selection and is stored in `localStorage`. Search the
calendar by title, description, or location and filter by category or calendar to quickly
find relevant events. Hebrew date numbers are displayed alongside the Gregorian calendar
to aid native speakers. Locations include an **Open Map** link for quick navigation.
Use the date picker to jump directly to a specific day.

If you try to add an event that overlaps an existing one, the app warns about the conflict so you can adjust the schedule.

Import existing calendars from an ICS file, export your current events, or share a
read-only ICS link using the **Import ICS**, **Export ICS**, and **Share ICS** buttons.

Use the **Settings** button to manage reusable categories and their default colors or
toggle **Do Not Disturb** for silent notifications. Event colors follow the selected
category.

The Settings modal also offers a **Courses** section. A card for each course shows
its name, code, color, and counts of upcoming meetings and assignments. Use the
**Add Course** wizard (Details → Meetings → Assignments/Topics) to define a course
once; the app then generates class sessions and due‑date events automatically.
Assignments also trigger a `suggestStudySessions` helper that proposes three
45‑minute study blocks in the 72–24 hours preceding the deadline, so you have
reserved time to review the relevant chapters.
A **Quick Study** button automatically creates up to three 50‑minute study blocks
for the coming week, prioritizing assignments by nearest due date while avoiding
conflicts with existing events. Each block is tagged with the **Focus** category
and uses the associated course color.
Selecting a course card opens a segmented view where you can review Details,
Meetings, Assignments, Exams, Topics, or Rules. Updating a meeting's location can
apply to all future class instances.

Browser notifications are scheduled for each reminder and respect Do Not Disturb when
enabled. When latitude and longitude are provided for a physical event, the app
automatically estimates travel time from your saved home address using an online
routing service (with haversine fallback when offline) and your preferred travel mode.
It then adds buffer minutes and, according to your profile policy, either creates a
preceding travel block or extends the event's start time. Travel blocks with the same
destination that touch are merged to avoid duplicates.

The **Profile** section in Settings stores home coordinates, travel mode (default
transit), default buffer (10 min), preferred routing provider (default Google), and
whether travel should be a separate event or an extension. You can also manage a list
of saved destinations (campus buildings, labs, etc.) that appear in the event dialog
for quick assignment. A travel preview lists each destination with an estimated travel
time from home based on your selected mode and buffer.

### Work shifts and tasks
Define workplaces with a default mode (physical or remote) and optional coordinates.
Each shift you add is rendered on the **Work** calendar; physical shifts automatically
receive a preceding travel block using the saved travel profile, while remote shifts
carry a “Remote” tag. Work tasks can also be entered and, when marked “include in time
blocking,” are considered by **Quick Study** alongside course assignments.

### Subtasks and progress tracking
Tasks support embedded subtasks with optional time estimates. Completing subtasks
updates the task’s progress value, and the remaining estimated minutes are used by the
study‑block scheduler so partially finished tasks request less time.

### Data model additions
```json
Task {
  id, courseId?, type: 'homework'|'project'|'lab'|'quiz'|'exam'|'work',
  title, due, link?, chapters: ChapterRange[], topics: string[],
  effortEstimateMin?, progress?, subtasks?: Subtask[], includeInStudy?
}
Subtask { id, title, estMin?, done }
WorkProfile { id, name, address?, defaultMode, lat?, lng?, tasks: Task[], shifts: WorkShift[] }
WorkShift { id, workProfileId, dayOfWeek, startTime, endTime, frequency, exceptions[], mode }
```

## Development
Install dependencies and start a dev server:

```
npm install
npm start
```

The provided VS Code configuration (`.vscode/`) lets you launch a Chrome session
with debugging enabled. Use the **Launch Chrome against localhost** configuration
from the Run and Debug panel. The tasks **Start dev server** and **Run tests**
are also available from the **Terminal > Run Task** menu for quick access to
`npm start` and `npm test`.

Install the recommended extensions when prompted in VS Code for an easy student
setup. They include Live Server for quick previews and the Chrome debugger for
breakpoint support.

## Roadmap
### MVP (Sprint 1–2)
- [x] Month and Agenda views
- [x] Event creation, editing, and deletion
- [x] Basic reminders
- [x] Categories with colors
- [x] Hebrew calendar display
- [x] Import/export via ICS
- [x] Basic search

#### Function references
- **Month and Agenda views** – configured when constructing the FullCalendar instance in `js/main.js`.
- **Event creation, editing, and deletion** – handled by `setupEventModal` in `js/eventModal.js`.
- **Basic reminders** – scheduled via `scheduleReminders` and cleared with `clearReminders` in `js/reminders.js`.
- **Categories with colors** – managed through `populateCategorySelects` and `renderCategoryList` in `js/categories.js`.
- **Hebrew calendar display** – provided by `getHebrewDate` in `js/utils.js` and applied in `js/main.js`.
- **Import/export via ICS** – wired up through `setupIcs` in `js/ics.js`.
- **Basic search** – implemented by `applyFilters` in `js/filters.js`.

### Sprint 3
- [x] Week view
- [x] Basic recurrence
- [x] App lock
- [x] Local backup

#### Function references
- **Week view** – enabled via `calendarOptions` in `js/views.js`.
- **Basic recurrence** – generated by `createRecurringEvents` in `js/recurrence.js`.
- **App lock** – enforced through `requirePin` in `js/lock.js`.
- **Local backup** – handled by `downloadBackup` and `importBackup` in `js/backup.js`.

### Sprint 4
- [x] Location with map links
- [x] Read-only ICS sharing

#### Function references
- **Location with map links** – URLs generated by `getMapLink` in `js/utils.js` and wired into the modal by `setupEventModal` in `js/eventModal.js`.
- **Read-only ICS sharing** – powered by `generateIcsBlob` and share handler in `setupIcs` within `js/ics.js`.

### Post-MVP
- [ ] Google/Outlook synchronization
- [ ] Participants or invitations
- [ ] Smart notifications
- [ ] Advanced recurrence rules

#### Function references
- **Google/Outlook synchronization** – create event URLs via `getGoogleCalendarUrl` and `getOutlookCalendarUrl` in `js/sync.js`.
- **Participants or invitations** – generate email links with `createInviteLinks` in `js/invitations.js`.
- **Smart notifications** – schedule departure alerts with `scheduleSmartNotification` in `js/smartNotifications.js`.
- **Advanced recurrence rules** – parse and expand RRULE strings using `parseRRule` and `generateOccurrences` in `js/advancedRecurrence.js`.
- **Course configuration** – manage course schedules and assignments through `setupCourseSettings` in `js/courses.js`.

### Student Pain Points and Future Directions
- Academic year and semester awareness with intelligent recurrence that respects breaks, intensive weeks, and daylight saving changes.
- Automatic syllabus import from PDF or Word to populate classes, labs, and deadlines, including exceptions.
- Workload planning heatmaps showing study hours, deadlines, and exams with suggestions for weekly balance.
- Smart time blocking that schedules study sessions based on task difficulty, energy levels, and available free time.
- Conflict detection between work and study events with alternate suggestions that factor in travel time.
- Support for Hebrew calendar events and recurrence by Hebrew dates, presented alongside the Gregorian calendar.
- LMS integration (Canvas, Moodle, etc.) to sync assignments, grades, and exam updates.
- Small team collaboration with shared project tasks, files, and deadlines without relying on a central cloud.
- Privacy-first storage with local encryption by default and selective sharing options.
- Event templates for common class or lab sessions with predefined fields for quick creation.
### Student-Focused MVP Proposal (Draft)
- Month/Week/Agenda views with full RTL support and search/filter by course or category.
- CRUD events with basic recurrence, multiple reminders, and per-course colors.
- ICS import plus semi-automated syllabus import via a three-step wizard with manual editing.
- Workload heatmap and smart time blocking that suggests study windows.
- Hebrew calendar display with simple Hebrew-date recurrence for selected events.
- Encrypted local storage, manual file backup, and read-only ICS sharing.

**Acceptance Criteria Examples**
- Syllabus import creates a series of deadline events with at least 90% accuracy in title, date, and time across a test sample.
- Detecting a conflict between a “work shift” and a “recitation” offers at least two alternate times in the current week.
- Time blocking proposes three study slots of at least 45 minutes each week, prioritized by upcoming deadlines.

### Data Model
```json
Course {
  id, name, code, semester, color,
  defaultLocation: { type: 'online'|'physical'|'hybrid', address?, room?, campus?, link? },
  meetings: Meeting[]
}
Meeting {
  id, courseId, kind: 'lecture'|'practice'|'lab',
  dayOfWeek, startTime, endTime, frequency, weeksPattern[], exceptions[],
  location: { type, address?, room?, campus?, link? },
  defaultReminders: number[]
}
Task {
  id, courseId, type: 'homework'|'project'|'lab'|'quiz'|'exam',
  title, due, link?, chapters: ChapterRange[], topics: string[],
  effortEstimateMin?: number
}
ChapterRange { source: 'book'|'slides'|'syllabus', from: string, to?: string }
UserProfile { homeAddress, travelMode: 'transit'|'drive'|'walk'|'bike', bufferMinutes, travelProvider }
TravelPolicy { addAs: 'event'|'buffer', roundTrip?: boolean }
```
Default profile: `homeAddress = 'Home'`, `travelMode = 'transit'`,
`bufferMinutes = 10`, `travelProvider = 'google'`.
