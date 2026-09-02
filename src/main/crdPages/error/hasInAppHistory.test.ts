import { afterEach, describe, expect, it, vi } from 'vitest';

import { hasInAppHistory } from './hasInAppHistory';

describe('hasInAppHistory', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false when window.history.length is 1', () => {
    vi.stubGlobal('window', { history: { length: 1 } });
    expect(hasInAppHistory()).toBe(false);
  });

  it('returns true when window.history.length is greater than 1', () => {
    vi.stubGlobal('window', { history: { length: 2 } });
    expect(hasInAppHistory()).toBe(true);
  });

  it('returns true for larger history depths', () => {
    vi.stubGlobal('window', { history: { length: 10 } });
    expect(hasInAppHistory()).toBe(true);
  });

  it('returns false when window is undefined (SSR safety)', () => {
    vi.stubGlobal('window', undefined);
    expect(hasInAppHistory()).toBe(false);
  });
});
