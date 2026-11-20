/**
 * client-7: verification (RESET / MANUALLY_VERIFY) and license-plan mutations are wrapped in
 * the shared `usePermissionDeniedNotifier` guard, so a denial that would otherwise be silent
 * surfaces the standard toast. VERIFICATION_REQUEST is deliberately NOT guarded — it always
 * falls through to MANUALLY_VERIFY, so it must not notify on its own.
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const notify = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const verifyOrgMock = vi.fn();
const listQueryMock = vi.fn();
const licensingQueryMock = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformAdminOrganizationsListQuery: (...args: unknown[]) => listQueryMock(...args),
  usePlatformLicensingPlansQuery: (...args: unknown[]) => licensingQueryMock(...args),
  useAdminOrganizationVerifyMutation: () => [verifyOrgMock, { loading: false }],
  useDeleteOrganizationMutation: () => [vi.fn(), { loading: false }],
  useAssignLicensePlanToAccountMutation: () => [vi.fn(), { loading: false }],
  useRevokeLicensePlanFromAccountMutation: () => [vi.fn(), { loading: false }],
  refetchPlatformAdminOrganizationsListQuery: (variables: unknown) => ({ variables }),
}));

import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';
import usePlatformAdminOrganizationsList from './usePlatformAdminOrganizationsList';

const org = (id: string, state: string) => ({
  id,
  account: { id: `${id}-account`, subscriptions: [] },
  profile: { displayName: id, url: `/org/${id}` },
  verification: { id: `${id}-verification`, state },
});

const forbiddenPolicyRejection = {
  graphQLErrors: [{ message: 'nope', extensions: { code: AlkemioGraphqlErrorCode.FORBIDDEN_POLICY } }],
};

describe('usePlatformAdminOrganizationsList — permission-denied notification', () => {
  beforeEach(() => {
    notify.mockClear();
    verifyOrgMock.mockReset();
    licensingQueryMock.mockReturnValue({ data: undefined, loading: false });
  });

  const setup = (state: string) => {
    listQueryMock.mockReturnValue({
      data: {
        platformAdmin: {
          organizations: {
            organization: [org('o1', state)],
            pageInfo: { endCursor: null, hasNextPage: false },
            total: 1,
          },
        },
      },
      loading: false,
      fetchMore: vi.fn(),
    });
    return renderHook(() => usePlatformAdminOrganizationsList());
  };

  it('notifies on a MANUALLY_VERIFY rejection consisting exclusively of FORBIDDEN_POLICY', async () => {
    verifyOrgMock.mockResolvedValueOnce({ data: {} }).mockRejectedValueOnce(forbiddenPolicyRejection);
    const { result } = setup('NOT_VERIFIED');

    await act(async () => {
      await result.current.handleVerification({ id: 'o1', value: 'o1', url: '/org/o1' }).catch(() => undefined);
    });

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('permissions.errorDenied', 'error');
  });

  it('notifies on a RESET rejection consisting exclusively of FORBIDDEN_POLICY', async () => {
    verifyOrgMock.mockRejectedValueOnce(forbiddenPolicyRejection);
    const { result } = setup('manuallyVerified');

    await act(async () => {
      await result.current.handleVerification({ id: 'o1', value: 'o1', url: '/org/o1' }).catch(() => undefined);
    });

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('permissions.errorDenied', 'error');
  });

  it('does not notify for the swallowed VERIFICATION_REQUEST leg — only the MANUALLY_VERIFY fallback counts', async () => {
    verifyOrgMock.mockRejectedValueOnce(forbiddenPolicyRejection).mockResolvedValueOnce({ data: {} });
    const { result } = setup('NOT_VERIFIED');

    await act(async () => {
      await result.current.handleVerification({ id: 'o1', value: 'o1', url: '/org/o1' });
    });

    expect(notify).not.toHaveBeenCalled();
  });
});
