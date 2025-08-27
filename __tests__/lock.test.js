import { savePin, clearPin, requirePin } from '../js/lock.js';

describe('app lock', () => {
  beforeEach(() => localStorage.clear());

  test('requirePin passes with no pin', () => {
    expect(requirePin({ prompt: () => '' })).toBe(true);
  });

  test('requirePin validates correct pin', () => {
    savePin('1234');
    expect(requirePin({ prompt: () => '1234' })).toBe(true);
  });

  test('requirePin rejects wrong pin', () => {
    savePin('1234');
    expect(requirePin({ prompt: () => '0000' })).toBe(false);
  });

  test('clearPin removes pin', () => {
    savePin('1111');
    clearPin();
    expect(requirePin({ prompt: () => '' })).toBe(true);
  });
});
