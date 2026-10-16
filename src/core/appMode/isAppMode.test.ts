import { afterEach, describe, expect, it } from 'vitest';
import { isAppMode } from './isAppMode';

describe('isAppMode', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'Capacitor');
  });

  it('is false in a plain browser — no Capacitor global at all', () => {
    expect(isAppMode()).toBe(false);
  });

  it('is false when the global exists but exposes no isNativePlatform', () => {
    window.Capacitor = {};

    expect(isAppMode()).toBe(false);
  });

  it('is false when the bridge reports a non-native platform (the Capacitor dev web build)', () => {
    window.Capacitor = { isNativePlatform: () => false };

    expect(isAppMode()).toBe(false);
  });

  it('is true only when the bridge reports exactly true', () => {
    window.Capacitor = { isNativePlatform: () => true };

    expect(isAppMode()).toBe(true);
  });
});
