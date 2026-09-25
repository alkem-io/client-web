import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  outcome: { value: { ok: false, error: 'exchange failed' } as { ok: boolean; error?: string; returnPath?: string } },
}));

vi.mock('./matrixCallback', () => ({
  handleMatrixCallback: vi.fn(async () => harness.outcome.value),
}));

import { isMatrixCallbackPage, runMatrixCallbackPage } from './matrixCallbackPage';

describe('matrixCallbackPage', () => {
  const replace = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    replace.mockClear();
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/matrix-callback', replace },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: originalLocation, configurable: true });
    vi.restoreAllMocks();
  });

  it('recognizes only the callback path', () => {
    expect(isMatrixCallbackPage()).toBe(true);
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/matrix-callback/x' },
      configurable: true,
    });
    expect(isMatrixCallbackPage()).toBe(false);
  });

  it('leaves for the saved return path on success', async () => {
    harness.outcome.value = { ok: true, returnPath: '/space/test' };
    await runMatrixCallbackPage();
    expect(replace).toHaveBeenCalledWith('/space/test');
  });

  it('goes home when the callback fails, instead of stranding the user', async () => {
    harness.outcome.value = { ok: false, error: 'exchange failed' };
    await runMatrixCallbackPage();
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('never navigates inside the silent-SSO iframe', async () => {
    harness.outcome.value = { ok: true, returnPath: '/space/test' };
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    await runMatrixCallbackPage();
    expect(replace).not.toHaveBeenCalled();
  });
});
