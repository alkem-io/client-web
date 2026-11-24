/**
 * Verification (RESET / MANUALLY_VERIFY) failures are reported by the global error link; the hook
 * adds no message of its own. VERIFICATION_REQUEST always falls through to MANUALLY_VERIFY, so it
 * opts out of the global handler.
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

import { OrgVerificationLifecycleEvents } from '@/domain/community/organization/model/OrganizationVerification';
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

  const verify = async (state: string) => {
    const { result } = setup(state);
    await act(async () => {
      await result.current.handleVerification({ id: 'o1', value: 'o1', url: '/org/o1' }).catch(() => undefined);
    });
  };

  it.each([
    ['MANUALLY_VERIFY', 'NOT_VERIFIED'],
    ['RESET', 'manuallyVerified'],
  ])('raises no message of its own when %s is refused', async (_event, state) => {
    verifyOrgMock.mockResolvedValueOnce({ data: {} }).mockRejectedValue(forbiddenPolicyRejection);

    await verify(state);

    expect(notify).not.toHaveBeenCalled();
  });

  it('opts the VERIFICATION_REQUEST attempt out of the global handler, and only that one', async () => {
    verifyOrgMock.mockResolvedValue({ data: {} });

    await verify('NOT_VERIFIED');

    const [request, manual] = verifyOrgMock.mock.calls.map(([options]) => options);
    expect(request.variables.input.eventName).toBe(OrgVerificationLifecycleEvents.VERIFICATION_REQUEST);
    expect(request.context).toEqual({ skipGlobalErrorHandler: true });
    expect(manual.variables.input.eventName).toBe(OrgVerificationLifecycleEvents.MANUALLY_VERIFY);
    expect(manual.context).toBeUndefined();
  });
});
