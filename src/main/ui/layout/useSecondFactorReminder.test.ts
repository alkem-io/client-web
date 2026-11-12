import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SECOND_FACTOR_REMINDER_DISMISSED_KEY, useSecondFactorReminder } from './useSecondFactorReminder';

const auth = vi.hoisted(() => ({ isAuthenticated: true, secondFactorRequired: false }));
const requirement = vi.hoisted(() => ({
  current: { covered: true, satisfied: false, deadline: '' as string | null },
}));
const querySpy = vi.hoisted(() => vi.fn());
const currentUser = vi.hoisted(() => ({ id: 'jane-id' }));

vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => auth,
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: currentUser.id, profile: { url: '/user/jane' } } }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSecondFactorRequirementQuery: (options: { skip: boolean }) => {
    querySpy(options);
    return { data: options.skip ? undefined : { me: { secondFactorRequirement: requirement.current } } };
  },
}));

const inDays = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

describe('useSecondFactorReminder', () => {
  beforeEach(() => {
    sessionStorage.clear();
    auth.secondFactorRequired = false;
    currentUser.id = 'jane-id';
    requirement.current = { covered: true, satisfied: false, deadline: inDays(10) };
    querySpy.mockClear();
  });

  it('is shown while covered, not satisfied and the deadline is ahead, with a link to Security', () => {
    const { result } = renderHook(() => useSecondFactorReminder());

    expect(result.current.visible).toBe(true);
    expect(result.current.securityHref).toBe('/user/jane/settings/security#two-step-verification');
  });

  it('is not shown again in the same browser session once dismissed', () => {
    const first = renderHook(() => useSecondFactorReminder());
    act(() => first.result.current.dismiss());
    expect(first.result.current.visible).toBe(false);

    const second = renderHook(() => useSecondFactorReminder());
    expect(second.result.current.visible).toBe(false);
    expect(sessionStorage.getItem(SECOND_FACTOR_REMINDER_DISMISSED_KEY)).toBe('jane-id');
  });

  it('is still shown to another person signing in on the tab after one dismissed it', () => {
    const first = renderHook(() => useSecondFactorReminder());
    act(() => first.result.current.dismiss());

    currentUser.id = 'john-id';
    expect(renderHook(() => useSecondFactorReminder()).result.current.visible).toBe(true);
  });

  it('is hidden when the session satisfies the requirement', () => {
    requirement.current = { covered: true, satisfied: true, deadline: inDays(10) };
    const { result } = renderHook(() => useSecondFactorReminder());
    expect(result.current.visible).toBe(false);
  });

  it('is hidden when not covered, or the deadline has passed', () => {
    requirement.current = { covered: false, satisfied: false, deadline: null };
    expect(renderHook(() => useSecondFactorReminder()).result.current.visible).toBe(false);

    requirement.current = { covered: true, satisfied: false, deadline: inDays(-1) };
    expect(renderHook(() => useSecondFactorReminder()).result.current.visible).toBe(false);
  });

  it('asks nothing and shows nothing while the session is refused', () => {
    auth.secondFactorRequired = true;
    const { result } = renderHook(() => useSecondFactorReminder());

    expect(querySpy).toHaveBeenCalledWith({ skip: true });
    expect(result.current.visible).toBe(false);
  });
});
