import { haversine } from './utils.js';

export const defaultProfile = {
  homeLat: null,
  homeLng: null,
  mode: 'transit',
  buffer: 10,
  policy: 'event', // 'event' or 'extend'
  provider: 'google',
  destinations: []
};

export function loadProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem('userProfile') || '{}');
    return { ...defaultProfile, ...stored };
  } catch {
    return { ...defaultProfile };
  }
}

export function saveProfile(profile) {
  localStorage.setItem('userProfile', JSON.stringify(profile));
}

export function estimateTravel(profile, destLat, destLng) {
  if (
    profile.homeLat == null ||
    profile.homeLng == null ||
    destLat == null ||
    destLng == null
  )
    return null;
  const speeds = { car: 60, transit: 40, bike: 15, walk: 5 };
  const speed = speeds[profile.mode] || 50;
  const dist = haversine(profile.homeLat, profile.homeLng, destLat, destLng);
  const minutes = (dist / speed) * 60 + profile.buffer;
  return minutes;
}
