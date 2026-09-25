import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  enabled: { value: true },
  handleMatrixCallback: vi.fn(async () => ({ ok: true })),
}));

vi.mock('./matrixCallback', () => ({
  handleMatrixCallback: harness.handleMatrixCallback,
}));

vi.mock('./matrixConfig', () => ({
  getConfig: () => ({ enabled: harness.enabled.value }),
}));

import { runMatrixCallbackPage } from './matrixCallbackPage';

describe('matrixCallbackPage', () => {
  const replace = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    replace.mockClear();
    harness.handleMatrixCallback.mockClear();
    harness.enabled.value = true;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/matrix-callback', replace },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: originalLocation, configurable: true });
    vi.restoreAllMocks();
  });

  it('inside the silent-SSO frame: exchanges the token and never navigates', async () => {
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    await runMatrixCallbackPage();
    expect(harness.handleMatrixCallback).toHaveBeenCalledOnce();
    expect(replace).not.toHaveBeenCalled();
  });

  it('opened top-level: goes home without touching the token', async () => {
    await runMatrixCallbackPage();
    expect(harness.handleMatrixCallback).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('flag off: goes home without touching the token, even framed', async () => {
    harness.enabled.value = false;
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    await runMatrixCallbackPage();
    expect(harness.handleMatrixCallback).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/');
  });
});
