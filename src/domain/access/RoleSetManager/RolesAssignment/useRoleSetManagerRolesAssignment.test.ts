import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the eight generated mutation hooks and the notification helper so the hook can be
// exercised as a plain function (no React runtime needed) — same pattern as useRoleSetManager.test.ts.
const notify = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notify,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const runMutation = vi.fn();
const mutationTuple = () => [runMutation, { loading: false }];

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAssignPlatformRoleToUserMutation: () => mutationTuple(),
  useRemovePlatformRoleFromUserMutation: () => mutationTuple(),
  useAssignRoleToUserMutation: () => mutationTuple(),
  useRemoveRoleFromUserMutation: () => mutationTuple(),
  useAssignRoleToOrganizationMutation: () => mutationTuple(),
  useRemoveRoleFromOrganizationMutation: () => mutationTuple(),
  useAssignRoleToVirtualContributorMutation: () => mutationTuple(),
  useRemoveRoleFromVirtualContributorMutation: () => mutationTuple(),
}));

const evictFromCache = vi.fn();
vi.mock('@/core/apollo/utils/evictFromCache', () => ({
  evictFromCache: (...args: unknown[]) => evictFromCache(...args),
}));

import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';
import useRoleSetManagerRolesAssignment from './useRoleSetManagerRolesAssignment';

/** Shaped like an ApolloError rejection: only `graphQLErrors[].extensions.code` is read. */
const graphqlRejection = (code: string) => ({
  graphQLErrors: [{ message: 'nope', extensions: { code } }],
});

const provided = () => useRoleSetManagerRolesAssignment({ roleSetId: 'rs1' });

/** Every assign/remove function the hook exposes, so no mutation escapes the contract. */
const allActions = [
  ['assignRoleToUser', (p: ReturnType<typeof provided>) => p.assignRoleToUser('u1', RoleName.Member)],
  ['removeRoleFromUser', (p: ReturnType<typeof provided>) => p.removeRoleFromUser('u1', RoleName.Member)],
  [
    'assignPlatformRoleToUser',
    (p: ReturnType<typeof provided>) => p.assignPlatformRoleToUser('u1', RoleName.GlobalAdmin),
  ],
  [
    'removePlatformRoleFromUser',
    (p: ReturnType<typeof provided>) => p.removePlatformRoleFromUser('u1', RoleName.GlobalAdmin),
  ],
  ['assignRoleToOrganization', (p: ReturnType<typeof provided>) => p.assignRoleToOrganization('o1', RoleName.Member)],
  [
    'removeRoleFromOrganization',
    (p: ReturnType<typeof provided>) => p.removeRoleFromOrganization('o1', RoleName.Member),
  ],
  [
    'assignRoleToVirtualContributor',
    (p: ReturnType<typeof provided>) => p.assignRoleToVirtualContributor('v1', RoleName.Member),
  ],
  [
    'removeRoleFromVirtualContributor',
    (p: ReturnType<typeof provided>) => p.removeRoleFromVirtualContributor('v1', RoleName.Member),
  ],
] as const;

describe('useRoleSetManagerRolesAssignment permission-error notification', () => {
  beforeEach(() => {
    notify.mockClear();
    runMutation.mockReset();
    evictFromCache.mockClear();
  });

  // spec SC-001 — no failed role-assignment mutation may be silent
  it.each(allActions)('%s notifies once on a FORBIDDEN rejection', async (_name, invoke) => {
    runMutation.mockRejectedValue(graphqlRejection(AlkemioGraphqlErrorCode.FORBIDDEN));

    await expect(invoke(provided())).rejects.toBeDefined();

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('permissions.errorDenied', 'error');
  });

  it('notifies on a FORBIDDEN_POLICY rejection', async () => {
    runMutation.mockRejectedValue(graphqlRejection(AlkemioGraphqlErrorCode.FORBIDDEN_POLICY));

    await expect(provided().assignRoleToUser('u1', RoleName.Member)).rejects.toBeDefined();

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('permissions.errorDenied', 'error');
  });

  // spec FR-006 — the global error link already reports these, so a second toast would duplicate it.
  // Ownership is whole-response: any non-authorization content hands the failure to the global
  // handler, including when it is mixed in alongside an authorization error.
  it.each([
    ['a validation error', graphqlRejection(AlkemioGraphqlErrorCode.ENTITY_NOT_FOUND)],
    ['a network error', { networkError: new Error('offline') }],
    ['a bare error', new Error('boom')],
    [
      'a response mixing FORBIDDEN with a non-authorization code',
      {
        graphQLErrors: [
          { message: 'nope', extensions: { code: AlkemioGraphqlErrorCode.FORBIDDEN } },
          { message: 'gone', extensions: { code: AlkemioGraphqlErrorCode.ENTITY_NOT_FOUND } },
        ],
      },
    ],
    [
      'a FORBIDDEN alongside a network error',
      {
        graphQLErrors: [{ message: 'nope', extensions: { code: AlkemioGraphqlErrorCode.FORBIDDEN } }],
        networkError: new Error('offline'),
      },
    ],
    [
      'a FORBIDDEN alongside a client error',
      {
        graphQLErrors: [{ message: 'nope', extensions: { code: AlkemioGraphqlErrorCode.FORBIDDEN } }],
        clientErrors: [new Error('bad request')],
      },
    ],
    ['an empty GraphQL error list', { graphQLErrors: [] }],
  ])('does not notify on %s', async (_label, rejection) => {
    runMutation.mockRejectedValue(rejection);

    await expect(provided().assignRoleToUser('u1', RoleName.Member)).rejects.toBeDefined();

    expect(notify).not.toHaveBeenCalled();
  });

  it('does not notify when the mutation succeeds', async () => {
    runMutation.mockResolvedValue({ data: {} });

    await expect(provided().assignRoleToUser('u1', RoleName.Member)).resolves.toBeDefined();

    expect(notify).not.toHaveBeenCalled();
  });

  // spec FR-016 — no automatic recovery; the stale control is corrected on next load, not by a refetch
  it('does not refetch or evict the cache when a mutation is rejected', async () => {
    runMutation.mockRejectedValue(graphqlRejection(AlkemioGraphqlErrorCode.FORBIDDEN));

    await expect(provided().assignRoleToUser('u1', RoleName.Member)).rejects.toBeDefined();

    expect(evictFromCache).not.toHaveBeenCalled();
  });

  it('re-throws the original rejection so callers can still react', async () => {
    const rejection = graphqlRejection(AlkemioGraphqlErrorCode.FORBIDDEN);
    runMutation.mockRejectedValue(rejection);

    await expect(provided().assignRoleToUser('u1', RoleName.Member)).rejects.toBe(rejection);
  });
});
