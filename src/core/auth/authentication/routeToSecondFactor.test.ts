import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();

const loadHelper = async (pathname: string) => {
  vi.stubGlobal('location', { pathname, replace });
  vi.resetModules();
  return (await import('./routeToSecondFactor')).routeToSecondFactor;
};

describe('routeToSecondFactor', () => {
  beforeEach(() => {
    replace.mockReset();
    vi.unstubAllGlobals();
  });

  it('navigates on the first call and not on a concurrent second one', async () => {
    const routeToSecondFactor = await loadHelper('/spaces');

    routeToSecondFactor();
    routeToSecondFactor();

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/second-factor');
  });

  it('does not navigate when already on the page', async () => {
    const routeToSecondFactor = await loadHelper('/second-factor');

    routeToSecondFactor();

    expect(replace).not.toHaveBeenCalled();
  });

  it('leaves the identity screens alone, so a settings flow handed back to /settings?flow= resumes', async () => {
    const routeToSecondFactor = await loadHelper('/settings');

    routeToSecondFactor();

    expect(replace).not.toHaveBeenCalled();
  });
});
