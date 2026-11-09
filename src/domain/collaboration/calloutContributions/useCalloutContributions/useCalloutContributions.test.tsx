import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutContributionsDocument } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import useCalloutContributions from './useCalloutContributions';

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}));

vi.mock('../post/useCalloutPostCreatedSubscription', () => ({
  default: () => ({ enabled: false }),
}));

const CALLOUT_ID = 'callout-1';
const PAGE_SIZE = 4;
const TOTAL = 6;

const link = (n: number) => ({
  __typename: 'CalloutContribution',
  id: `contribution-${n}`,
  sortOrder: n,
  link: {
    __typename: 'Link',
    id: `link-${n}`,
    uri: `https://example.org/${n}`,
    profile: { __typename: 'Profile', id: `profile-${n}`, displayName: `Link ${n}`, description: null },
    authorization: { __typename: 'Authorization', id: `auth-${n}`, myPrivileges: [] },
  },
});

const result = (count: number) => ({
  data: {
    lookup: {
      __typename: 'LookupQueryResults',
      callout: {
        __typename: 'Callout',
        id: CALLOUT_ID,
        contributions: Array.from({ length: count }, (_, i) => link(i + 1)),
        contributionsCount: { __typename: 'CalloutContributionsCountOutput', link: TOTAL },
      },
    },
  },
});

const isPage = (variables: Record<string, unknown>) => variables.limit === PAGE_SIZE;
const isFull = (variables: Record<string, unknown>) => variables.limit === undefined;

const mocks: MockedResponse[] = [
  { request: { query: CalloutContributionsDocument }, variableMatcher: isPage, result: result(PAGE_SIZE) },
  { request: { query: CalloutContributionsDocument }, variableMatcher: isFull, error: new Error('network down') },
  { request: { query: CalloutContributionsDocument }, variableMatcher: isFull, result: result(TOTAL) },
];

const callout = {
  id: CALLOUT_ID,
  settings: { contribution: { allowedTypes: [CalloutContributionType.Link] } },
};

describe('useCalloutContributions fetch all', () => {
  it('keeps the loaded page when the full fetch fails and retries it on the next request', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    );
    const { result: hook } = renderHook(
      () =>
        useCalloutContributions({
          callout: callout as never,
          contributionType: CalloutContributionType.Link,
          pageSize: PAGE_SIZE,
        }),
      { wrapper }
    );

    await waitFor(() => expect(hook.current.contributions.items).toHaveLength(PAGE_SIZE));
    expect(hook.current.contributions.hasMore).toBe(true);

    act(() => hook.current.contributions.setFetchAll(true));
    await waitFor(() => expect(hook.current.loading).toBe(false));

    expect(hook.current.contributions.items).toHaveLength(PAGE_SIZE);
    expect(hook.current.contributions.total).toBe(TOTAL);
    expect(hook.current.contributions.hasMore).toBe(true);

    act(() => hook.current.contributions.setFetchAll(true));
    await waitFor(() => expect(hook.current.contributions.items).toHaveLength(TOTAL));
    expect(hook.current.contributions.hasMore).toBe(false);
  });
});
