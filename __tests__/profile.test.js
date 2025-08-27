import { loadProfile, saveProfile, defaultProfile, estimateTravel } from '../js/profile.js';

describe('profile storage', () => {
  beforeEach(() => localStorage.clear());

  test('loadProfile returns defaults', () => {
    const p = loadProfile();
    expect(p).toEqual(defaultProfile);
  });

  test('saveProfile persists data', () => {
    const profile = {
      homeLat: 1,
      homeLng: 2,
      mode: 'walk',
      buffer: 5,
      policy: 'extend',
      provider: 'osrm',
      destinations: []
    };
    saveProfile(profile);
    expect(loadProfile()).toEqual(profile);
  });

  test('estimateTravel returns minutes with buffer', () => {
    const profile = {
      homeLat: 0,
      homeLng: 0,
      mode: 'car',
      buffer: 10,
      provider: 'google'
    };
    const mins = estimateTravel(profile, 0, 1); // ~111km
    expect(Math.round(mins)).toBe(121); // 111km at 60km/h ~111min +10 buffer
  });
});
