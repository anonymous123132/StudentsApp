export function loadPin() {
  return localStorage.getItem('appLockPin') || '';
}

export function savePin(pin) {
  localStorage.setItem('appLockPin', pin);
}

export function clearPin() {
  localStorage.removeItem('appLockPin');
}

export function requirePin(win = window) {
  const pin = loadPin();
  if (!pin) return true;
  const entered = win.prompt('Enter PIN');
  return entered === pin;
}
