import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the ten generated mutation hooks and the notification helper so the hook can be
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
  useAssignPlatformRoleToOrganizationMutation: () => mutationTuple(),
  useRemovePlatformRoleFromOrganizationMutation: () => mutationTuple(),
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
    (p: ReturnType<typeof provided>) => p.assignPlatformRoleToUser('u1', RoleName.PlatformRolesAdmin),
  ],
  [
    'removePlatformRoleFromUser',
    (p: ReturnType<typeof provided>) => p.removePlatformRoleFromUser('u1', RoleName.PlatformRolesAdmin),
  ],
  [
    'assignPlatformRoleToOrganization',
    (p: ReturnType<typeof provided>) => p.assignPlatformRoleToOrganization('o1', RoleName.FeatureBetaTester),
  ],
  [
    'removePlatformRoleFromOrganization',
    (p: ReturnType<typeof provided>) => p.removePlatformRoleFromOrganization('o1', RoleName.FeatureBetaTester),
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

describe('useRoleSetManagerRolesAssignment failures', () => {
  beforeEach(() => {
    notify.mockClear();
    runMutation.mockReset();
    evictFromCache.mockClear();
  });

  // The global error link gives a refused mutation its one message; the hook adds none.
  it.each(allActions)('%s re-throws a not-available rejection without a message of its own', async (_name, invoke) => {
    const rejection = graphqlRejection(AlkemioGraphqlErrorCode.FORBIDDEN_POLICY);
    runMutation.mockRejectedValue(rejection);

    await expect(invoke(provided())).rejects.toBe(rejection);

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
});
