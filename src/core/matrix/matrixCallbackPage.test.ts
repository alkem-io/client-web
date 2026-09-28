import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  configured: { value: true },
  handleMatrixCallback: vi.fn(async () => {}),
}));

vi.mock('./matrixCallback', () => ({
  handleMatrixCallback: harness.handleMatrixCallback,
}));

vi.mock('./matrixConfig', () => ({
  getConfig: () => ({ homeserverUrl: harness.configured.value ? 'https://matrix.dev-alkem.io' : '' }),
}));

import { runMatrixCallbackPage } from './matrixCallbackPage';

describe('matrixCallbackPage', () => {
  const replace = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    replace.mockClear();
    harness.handleMatrixCallback.mockClear();
    harness.configured.value = true;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, replace },
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

  it('not configured for this environment: goes home without touching the token, even framed', async () => {
    harness.configured.value = false;
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    await runMatrixCallbackPage();
    expect(harness.handleMatrixCallback).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/');
  });
});
