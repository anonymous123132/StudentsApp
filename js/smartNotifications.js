import { haversine } from './utils.js';

export function scheduleSmartNotification(event, currentLat, currentLng, notify) {
  if (typeof notify !== 'function') throw new Error('notify function required');
  const { lat, lng } = event.extendedProps || {};
  if ([currentLat, currentLng, lat, lng].some(v => isNaN(v))) return null;
  const distKm = haversine(currentLat, currentLng, lat, lng);
  const travelMinutes = (distKm / 50) * 60; // assume 50 km/h
  const departTime = new Date(event.start.getTime() - travelMinutes * 60000);
  const delay = departTime.getTime() - Date.now();
  if (delay <= 0) {
    notify(`Leave for ${event.title}`);
    return 0;
  }
  return setTimeout(() => notify(`Leave for ${event.title}`), delay);
}
