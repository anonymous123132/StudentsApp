import {
  createCourse,
  createMeeting,
  createTask,
  createChapterRange,
  createUserProfile,
  createTravelPolicy,
  createSubtask,
  createWorkProfile,
  createWorkShift,
  updateTaskProgress
} from '../js/models.js';

describe('data model factories', () => {
  test('createCourse provides defaults', () => {
    const c = createCourse({ name: 'Math', code: 'M101', semester: 'A', color: '#ff0' });
    expect(c.defaultLocation).toEqual({ type: 'online' });
    expect(c.meetings).toEqual([]);
    expect(c.name).toBe('Math');
  });

  test('createMeeting builds meeting object', () => {
    const m = createMeeting({ courseId: 'c1', kind: 'lab', dayOfWeek: 2, startTime: '09:00', endTime: '10:00' });
    expect(m.location).toEqual({ type: 'online' });
    expect(m.kind).toBe('lab');
  });

  test('createTask captures optional fields', () => {
    const chapters = [createChapterRange({ source: 'book', from: '1', to: '2' })];
    const subtasks = [
      createSubtask({ title: 'Part1', estMin: 30, done: true }),
      createSubtask({ title: 'Part2', estMin: 30 })
    ];
    const t = createTask({ courseId: 'c1', type: 'project', title: 'Proj', due: '2024-01-01', link: 'http://x', chapters, topics: ['a'], effortEstimateMin: 60, subtasks });
    expect(t.link).toBe('http://x');
    expect(t.chapters[0].to).toBe('2');
    expect(t.subtasks.length).toBe(2);
    expect(updateTaskProgress(t)).toBeCloseTo(0.5);
  });

  test('createUserProfile defaults', () => {
    const p = createUserProfile();
    expect(p).toEqual({
      homeAddress: 'Home',
      travelMode: 'transit',
      bufferMinutes: 10,
      travelProvider: 'google'
    });
  });

  test('createUserProfile and travel policy', () => {
    const p = createUserProfile({ homeAddress: '123 St', travelMode: 'walk', bufferMinutes: 5, travelProvider: 'osm' });
    expect(p.travelMode).toBe('walk');
    const policy = createTravelPolicy({ addAs: 'buffer', roundTrip: true });
    expect(policy.roundTrip).toBe(true);
  });

  test('work profile and shift factories', () => {
    const wp = createWorkProfile({ name: 'Store', defaultMode: 'physical', lat: 0, lng: 1 });
    expect(wp.tasks).toEqual([]);
    const ws = createWorkShift({ workProfileId: wp.id, dayOfWeek: 1, startTime: '08:00', endTime: '16:00', mode: 'physical' });
    expect(ws.mode).toBe('physical');
  });
});
