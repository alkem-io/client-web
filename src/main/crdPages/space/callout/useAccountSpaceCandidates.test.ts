/**
 * The derived candidate model (084 T102/T104).
 *
 * Everything asserted here is computed on the client from ONE fetched set of
 * four scalars, so these are the only assertions anywhere that the ancestor
 * chain, the host row and the "in this space" predicate are built correctly —
 * the server exposes none of them (spec FR-012b).
 */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useAccountSpaceCandidates } from './useAccountSpaceCandidates';

const HOST = 'host-l1';

/**
 * One account, as the picker sees it from the host L1 "Host":
 *
 *   Root (L0)
 *     ├─ Host (L1)        ← the callout lives here
 *     │    └─ Child (L2)
 *     └─ Cousin (L1)
 *   Sibling (L0)          ← another L0 of the same account
 *     └─ Child (L1)       ← name clash with the host's own Child
 *   Orphan (L1)           ← its parent L0 is NOT readable, so absent here
 *
 * Deliberately out of path order, so the ordering assertion exercises the sort
 * rather than the response.
 */
const ACCOUNT = [
  { id: 'sibling-child', displayName: 'Child', level: SpaceLevel.L1, parentSpaceID: 'sibling-l0' },
  { id: 'host-child', displayName: 'Child', level: SpaceLevel.L2, parentSpaceID: HOST },
  { id: 'root-l0', displayName: 'Root', level: SpaceLevel.L0, parentSpaceID: undefined },
  { id: 'orphan-l1', displayName: 'Orphan', level: SpaceLevel.L1, parentSpaceID: 'unreadable-l0' },
  { id: HOST, displayName: 'Host', level: SpaceLevel.L1, parentSpaceID: 'root-l0' },
  { id: 'sibling-l0', displayName: 'Sibling', level: SpaceLevel.L0, parentSpaceID: undefined },
  { id: 'cousin-l1', displayName: 'Cousin', level: SpaceLevel.L1, parentSpaceID: 'root-l0' },
];

const mocks = vi.hoisted(() => ({
  options: [] as { variables?: { spaceId: string }; skip?: boolean }[],
  accountSpaces: undefined as { id: string; displayName: string; level: string; parentSpaceID?: string }[] | undefined,
  loading: false,
  error: undefined as Error | undefined,
  refetch: vi.fn(),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAccountSpaceCandidatesQuery: (options: { variables?: { spaceId: string }; skip?: boolean }) => {
    mocks.options.push(options);
    return {
      data: mocks.accountSpaces
        ? { lookup: { space: { id: options.variables?.spaceId, accountSpaces: mocks.accountSpaces } } }
        : undefined,
      loading: mocks.loading,
      error: mocks.error,
      refetch: mocks.refetch,
    };
  },
}));

const renderFor = (hostSpaceId: string | undefined, skip?: boolean) =>
  renderHook(() => useAccountSpaceCandidates({ hostSpaceId, skip })).result.current;

const byId = (hostSpaceId: string) => {
  const model = renderFor(hostSpaceId);
  return (id: string) => {
    const found = model.candidates.find(candidate => candidate.id === id);
    if (!found) throw new Error(`no candidate ${id}`);
    return found;
  };
};

beforeEach(() => {
  mocks.options = [];
  mocks.accountSpaces = ACCOUNT;
  mocks.loading = false;
  mocks.error = undefined;
});

describe('useAccountSpaceCandidates — the fetched set', () => {
  // FR-015 / SC-008: the picker holds the query's variables stable for its whole
  // lifetime, so editing the selection cannot issue a second request. RED against
  // any `keepIDs`-style variable carrying the current selection.
  test('keys the query on the host space alone — no selection in the variables', () => {
    renderFor(HOST);

    expect(mocks.options[0].variables).toEqual({ spaceId: HOST });
  });

  test('does not issue the query when skipped, or with no host space', () => {
    renderFor(HOST, true);
    expect(mocks.options[0].skip).toBe(true);

    mocks.options = [];
    renderFor(undefined);
    expect(mocks.options[0].skip).toBe(true);
  });

  // An errored query that only reported `{ loading: false, data: undefined }` would
  // present as a resolved, EMPTY account — "this account has no other spaces" on a
  // path where the list simply failed to load (FR-015/FR-026).
  test('surfaces the error distinguishably from a resolved empty set', () => {
    mocks.accountSpaces = undefined;
    mocks.error = new Error('Forbidden');

    const model = renderFor(HOST);

    expect(model.candidates).toEqual([]);
    expect(model.error).toBe(mocks.error);
  });
});

describe('useAccountSpaceCandidates — the derived model', () => {
  test('carries each candidate level, covering all three platform levels (FR-028)', () => {
    const get = byId(HOST);

    expect(get('root-l0').level).toBe(SpaceLevel.L0);
    expect(get(HOST).level).toBe(SpaceLevel.L1);
    expect(get('host-child').level).toBe(SpaceLevel.L2);
  });

  test('builds the ancestor path outermost first', () => {
    const get = byId(HOST);

    expect(get('host-child').ancestorPath.map(a => a.displayName)).toEqual(['Root', 'Host']);
    expect(get(HOST).ancestorPath.map(a => a.displayName)).toEqual(['Root']);
    expect(get('root-l0').ancestorPath).toEqual([]);
  });

  // Contract S3: an ancestor the editor cannot read is simply absent from the
  // path. A placeholder row would itself disclose that a space is there.
  test('renders the readable prefix only when an ancestor is not in the response', () => {
    const get = byId(HOST);

    expect(get('orphan-l1').ancestorPath).toEqual([]);
    expect(JSON.stringify(get('orphan-l1'))).not.toContain('unreadable-l0');
  });

  test('marks exactly the host space as the host row', () => {
    const model = renderFor(HOST);

    expect(model.candidates.filter(c => c.isHost).map(c => c.id)).toEqual([HOST]);
  });

  test('flags a display name shared with another candidate, and only that', () => {
    const get = byId(HOST);

    expect(get('host-child').hasNameClash).toBe(true);
    expect(get('sibling-child').hasNameClash).toBe(true);
    expect(get('cousin-l1').hasNameClash).toBe(false);
  });

  // DEV-3 / FR-024: an empty query renders this whole list in this order, which is
  // what replaces the cut browse mode. RED against returning the response order.
  test('orders the set by ancestor path then name', () => {
    const model = renderFor(HOST);

    expect(model.candidates.map(c => c.id)).toEqual([
      'orphan-l1',
      'root-l0',
      'cousin-l1',
      HOST,
      'host-child',
      'sibling-l0',
      'sibling-child',
    ]);
  });
});

/**
 * The "in this space" badge is the only own-tree signal left after ruling D2 cut
 * the group headers, and revision 6 deleted its server field — so this predicate
 * is derived here and nowhere else (spec FR-012b, A26/A28).
 */
describe('useAccountSpaceCandidates — inHostTree', () => {
  test('is true for a descendant of the host', () => {
    expect(byId(HOST)('host-child').inHostTree).toBe(true);
  });

  test('is false for the host row itself', () => {
    expect(byId(HOST)(HOST).inHostTree).toBe(false);
  });

  test("is false for a sibling L0's subspace", () => {
    expect(byId(HOST)('sibling-child').inHostTree).toBe(false);
  });

  // The two cases revision 5 put on the server: walking DOWN from the host, an
  // ancestor and a cousin branch are both outside the host's tree even though
  // they share its root.
  test("is false for the host's own parent L0 and for a cousin branch", () => {
    const get = byId(HOST);

    expect(get('root-l0').inHostTree).toBe(false);
    expect(get('cousin-l1').inHostTree).toBe(false);
  });

  // The whole chain counts, not just the immediate parent: an L0 host's L2
  // grandchildren are in its tree. RED against the `parentSpaceID === hostSpaceId`
  // shortcut, which is indistinguishable from the correct derivation for an L1
  // host and wrong for an L0 one.
  test('is true for a grandchild when the host is an L0', () => {
    const get = byId('root-l0');

    expect(get('host-child').inHostTree).toBe(true);
    expect(get(HOST).inHostTree).toBe(true);
    expect(get('sibling-child').inHostTree).toBe(false);
  });

  // An L2 host has no descendants at all, so no row can carry the badge. RED
  // against a per-host-level branch that got the L2 case the wrong way round.
  test('is false for every candidate when the host is an L2', () => {
    const model = renderFor('host-child');

    expect(model.candidates.filter(c => c.inHostTree)).toEqual([]);
  });
});
