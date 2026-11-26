import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { NotAuthorizedError } from '@/core/40XErrorHandler/40XErrors';

const currentUser = vi.fn();
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => currentUser(),
}));

import { useSpaceSettingsAccessGuard } from './useSpaceSettingsAccessGuard';

const wrapper = ({ children }: PropsWithChildren) => (
  <MemoryRouter initialEntries={['/space-a/settings/community']}>{children}</MemoryRouter>
);

const run = (canUpdate: boolean | undefined, scopeLoading: boolean) => {
  try {
    renderHook(() => useSpaceSettingsAccessGuard(canUpdate, scopeLoading), { wrapper });
    return undefined;
  } catch (error) {
    return error;
  }
};

describe('useSpaceSettingsAccessGuard (SpaceCan.update)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders while the scope or the viewer is still loading', () => {
    currentUser.mockReturnValue({ isAuthenticated: true, loading: false });
    expect(run(undefined, true)).toBeUndefined();
    expect(run(false, true)).toBeUndefined();
    currentUser.mockReturnValue({ isAuthenticated: false, loading: true });
    expect(run(false, false)).toBeUndefined();
  });

  test('renders for a viewer with the update verdict', () => {
    currentUser.mockReturnValue({ isAuthenticated: true, loading: false });
    expect(run(true, false)).toBeUndefined();
  });

  test('an authenticated viewer without update gets the forbidden page (no redirect)', () => {
    currentUser.mockReturnValue({ isAuthenticated: true, loading: false });
    const error = run(false, false);
    expect(error).toBeInstanceOf(NotAuthorizedError);
    expect((error as NotAuthorizedError).redirectUrl).toBeUndefined();
  });

  test('an anonymous viewer without update is sent to sign in with the return URL', () => {
    currentUser.mockReturnValue({ isAuthenticated: false, loading: false });
    const error = run(false, false);
    expect(error).toBeInstanceOf(NotAuthorizedError);
    expect((error as NotAuthorizedError).redirectUrl).toMatch(/returnUrl=.*\/space-a\/settings\/community$/);
  });
});
