import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { ContributorTypeId } from '@/crd/forms/callout/types';
import { useSelectionCandidates } from './useSelectionCandidates';

const profile = (displayName: string, avatarUri?: string) => ({
  displayName,
  avatar: avatarUri ? { uri: avatarUri } : undefined,
});

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useRoleSetRoleAssignmentQuery: () => ({
    data: {
      lookup: {
        roleSet: {
          usersInRoles: [{ users: [{ id: 'user-1', profile: profile('Alice Adams') }] }],
          organizationsInRoles: [
            { organizations: [{ id: 'org-1', profile: profile('Acme Org', 'https://cdn/acme.png') }] },
          ],
          virtualContributorsInRoles: [{ virtualContributors: [{ id: 'vc-1', profile: profile('Helper Bot') }] }],
        },
      },
    },
    loading: false,
    refetch: vi.fn(),
  }),
}));

const render = (contributorTypes: ContributorTypeId[]) =>
  renderHook(() => useSelectionCandidates({ roleSetId: 'rs-1', contributorTypes })).result.current;

describe('useSelectionCandidates — candidates', () => {
  test('offers users and organizations but never virtual contributors', () => {
    const { candidates } = render(['user', 'organization', 'virtualContributor']);

    expect(candidates.map(c => c.id)).toEqual(['user-1', 'org-1']);
  });

  test('a kind the callout does not configure is not offered (INV-OFFER)', () => {
    const { candidates } = render(['user']);

    expect(candidates.map(c => c.id)).toEqual(['user-1']);
  });

  test('candidates keep insertion order — users before organizations', () => {
    const { candidates } = render(['organization', 'user']);

    expect(candidates.map(c => c.kind)).toEqual(['user', 'organization']);
  });

  test('resolveChips resolves every kind against the full membership set', () => {
    const { resolveChips } = render(['user']);

    expect(resolveChips(['org-1', 'vc-1', 'missing-1'])).toEqual([
      {
        kind: 'organization',
        id: 'org-1',
        displayName: 'Acme Org',
        avatarUrl: 'https://cdn/acme.png',
        eligible: true,
      },
      { kind: 'virtualContributor', id: 'vc-1', displayName: 'Helper Bot', avatarUrl: undefined, eligible: true },
      { kind: 'virtualContributor', id: 'missing-1', displayName: 'missing-1', eligible: false },
    ]);
  });
});
