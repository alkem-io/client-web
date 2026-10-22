import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useCrdOrganizationProfilePageData } from '../useCrdOrganizationProfilePageData';

const mocks = vi.hoisted(() => ({
  hostedQuery: vi.fn(),
  currentUser: vi.fn(),
  refetchQueries: vi.fn(),
}));

vi.mock('@apollo/client', () => ({
  useApolloClient: () => ({ refetchQueries: mocks.refetchQueries }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useOrganizationHostedResourcesQuery: mocks.hostedQuery,
  OrganizationInfoDocument: 'OrganizationInfoDocument',
  OrganizationHostedResourcesDocument: 'OrganizationHostedResourcesDocument',
}));
vi.mock('@/domain/community/organization/hooks/useOrganizationContext', () => ({
  useOrganizationContext: () => ({ organization: { id: 'org-1' }, loading: false }),
}));
vi.mock('@/domain/community/organization/useOrganization/useOrganization', () => ({
  default: () => ({ loading: false }),
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: mocks.currentUser,
}));

describe('useCrdOrganizationProfilePageData', () => {
  beforeEach(() => {
    mocks.hostedQuery.mockReset();
    mocks.hostedQuery.mockImplementation(({ skip }: { skip: boolean }) => ({ data: undefined, loading: !skip }));
  });

  test('the hosted resources read opts out of the global error toast', () => {
    mocks.currentUser.mockReturnValue({ isAuthenticated: true, loadingMe: false });
    renderHook(() => useCrdOrganizationProfilePageData());

    expect(mocks.hostedQuery).toHaveBeenCalledWith(
      expect.objectContaining({ context: { skipGlobalErrorHandler: true } })
    );
  });

  test('hosted resources stay loading while auth is still resolving', () => {
    mocks.currentUser.mockReturnValue({ isAuthenticated: false, loadingMe: true });
    const { result } = renderHook(() => useCrdOrganizationProfilePageData());

    expect(mocks.hostedQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    expect(result.current.loading.account).toBe(true);
  });

  test('a guest resolves to not loading once auth is known', () => {
    mocks.currentUser.mockReturnValue({ isAuthenticated: false, loadingMe: false });
    const { result } = renderHook(() => useCrdOrganizationProfilePageData());

    expect(result.current.loading.account).toBe(false);
    expect(result.current.loadingMe).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('refreshing after a membership change refetches the hosted resources with the organization', () => {
    mocks.currentUser.mockReturnValue({ isAuthenticated: true, loadingMe: false });
    const { result } = renderHook(() => useCrdOrganizationProfilePageData());

    result.current.refreshOrganization();

    expect(mocks.refetchQueries).toHaveBeenCalledWith({
      include: expect.arrayContaining(['OrganizationInfoDocument', 'OrganizationHostedResourcesDocument']),
    });
  });
});
