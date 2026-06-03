import type { FieldPolicy } from '@apollo/client';
import { describe, expect, it } from 'vitest';
import { paginationFieldPolicy } from './paginationPolicy';

type MergeFn = NonNullable<FieldPolicy['merge']> & ((existing: unknown, incoming: unknown, opts: unknown) => unknown);

const mergeOf = (policy: ReturnType<typeof paginationFieldPolicy>) => (policy as { merge: MergeFn }).merge;

const opts = (after?: string) => ({
  args: after ? { first: 25, after } : { first: 25 },
  isReference: () => false,
});

const pageInfo = (endCursor: string, hasNextPage: boolean) => ({
  __typename: 'PageInfo',
  startCursor: 'start',
  endCursor,
  hasNextPage,
  hasPreviousPage: false,
});

// A `total`-bearing connection (PaginatedLibraryTemplateResults), like the Innovation Library uses.
const templatePage = (results: { name: string }[], total: number, endCursor: string, hasNextPage: boolean) => ({
  __typename: 'PaginatedLibraryTemplateResults',
  total,
  templateResults: results,
  pageInfo: pageInfo(endCursor, hasNextPage),
});

describe('paginationFieldPolicy — total-bearing connections (Innovation Library)', () => {
  const merge = mergeOf(paginationFieldPolicy(['filter'], 'TemplateResult'));

  it('appends the next page on fetchMore and preserves total (regression: previously threw "More than 1 data field")', () => {
    const first = templatePage([{ name: 't1' }, { name: 't2' }], 7, 'c2', true);
    const second = templatePage([{ name: 't3' }, { name: 't4' }], 7, 'c4', true);

    const merged = merge(first, second, opts('c2')) as ReturnType<typeof templatePage>;

    expect(merged.templateResults.map(r => r.name)).toEqual(['t1', 't2', 't3', 't4']);
    expect(merged.total).toBe(7);
    expect(merged.pageInfo.endCursor).toBe('c4');
    expect(merged.pageInfo.hasNextPage).toBe(true);
  });

  it('replaces the list (and keeps total) when merged with no cursor — the stale-cursor refetch / first-page reset path', () => {
    const existing = templatePage([{ name: 't1' }, { name: 't2' }, { name: 't3' }], 7, 'c3', true);
    const freshFirstPage = templatePage([{ name: 'n1' }, { name: 'n2' }], 5, 'c-new', true);

    const merged = merge(existing, freshFirstPage, opts(undefined)) as ReturnType<typeof templatePage>;

    expect(merged.templateResults.map(r => r.name)).toEqual(['n1', 'n2']);
    expect(merged.total).toBe(5);
  });

  it('returns the first page verbatim (with total) when there is no existing list', () => {
    const incoming = templatePage([{ name: 't1' }], 3, 'c1', true);
    const merged = merge(undefined, incoming, opts(undefined)) as ReturnType<typeof templatePage>;
    expect(merged.total).toBe(3);
    expect(merged.templateResults).toHaveLength(1);
  });
});

describe('paginationFieldPolicy — connections without total stay unaffected', () => {
  const merge = mergeOf(paginationFieldPolicy(['filter'], 'User'));

  const userPage = (users: { __typename: string; id: string }[], endCursor: string, hasNextPage: boolean) => ({
    __typename: 'PaginatedUsers',
    users,
    pageInfo: pageInfo(endCursor, hasNextPage),
  });

  it('appends by id and does not introduce a total key', () => {
    const first = userPage([{ __typename: 'User', id: 'u1' }], 'u1', true);
    const second = userPage([{ __typename: 'User', id: 'u2' }], 'u2', true);

    const merged = merge(first, second, opts('u1')) as ReturnType<typeof userPage> & { total?: number };

    expect(merged.users.map(u => u.id)).toEqual(['u1', 'u2']);
    expect('total' in merged).toBe(false);
  });
});
