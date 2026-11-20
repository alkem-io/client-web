import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useCrdUserProfilePageData } from '../useCrdUserProfilePageData';

const mocks = vi.hoisted(() => ({
  hostedQuery: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUserHostedResourcesQuery: mocks.hostedQuery,
}));
vi.mock('@/domain/community/user/userContributions/useUserContributions', () => ({ default: () => [] }));
vi.mock('@/domain/community/user/userContributions/useUserOrganizationIds', () => ({ default: () => [] }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: mocks.currentUser,
}));
vi.mock('../../useCanEditSettings', () => ({ default: () => ({ canEditSettings: false }) }));
vi.mock('../../useUserPageRouteContext', () => ({ default: () => ({ userId: 'user-1', loading: false }) }));

describe('useCrdUserProfilePageData', () => {
  beforeEach(() => {
    mocks.hostedQuery.mockReset();
    mocks.hostedQuery.mockImplementation(({ skip }: { skip: boolean }) => ({ data: undefined, loading: !skip }));
  });

  test('the hosted resources read opts out of the global error toast', () => {
    mocks.currentUser.mockReturnValue({ isAuthenticated: true, loadingMe: false });
    renderHook(() => useCrdUserProfilePageData());

    expect(mocks.hostedQuery).toHaveBeenCalledWith(
      expect.objectContaining({ context: { skipGlobalErrorHandler: true } })
    );
  });

  test('hosted resources stay loading while auth is still resolving', () => {
    mocks.currentUser.mockReturnValue({ isAuthenticated: false, loadingMe: true });
    const { result } = renderHook(() => useCrdUserProfilePageData());

    expect(mocks.hostedQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    expect(result.current.loading.userAccount).toBe(true);
  });

  test('a guest resolves to not loading once auth is known', () => {
    mocks.currentUser.mockReturnValue({ isAuthenticated: false, loadingMe: false });
    const { result } = renderHook(() => useCrdUserProfilePageData());

    expect(result.current.loading.userAccount).toBe(false);
  });
});
