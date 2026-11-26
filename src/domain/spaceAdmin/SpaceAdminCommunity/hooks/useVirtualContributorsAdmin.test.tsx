import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import type { SpaceCommunityCandidate } from '@/domain/spaceAdmin/SpaceAdminCommunity/native/spaceCommunityNative';
import useVirtualContributorsAdmin from './useVirtualContributorsAdmin';

const inAct = async (load: () => Promise<SpaceCommunityCandidate[]>) => {
  let found: SpaceCommunityCandidate[] = [];
  await act(async () => {
    found = await load();
  });
  return found;
};

const vc = (id: string) => ({
  __typename: 'Agent',
  id,
  actorType: 'virtual_contributor',
  url: `/vc/${id}`,
  keywords: ['kb'],
  about: {
    __typename: 'About',
    displayName: id,
    description: `About ${id}`,
    location: null,
    avatar: null,
  },
});
const page = (ids: string[], endCursor: string | null) => ({
  candidates: {
    __typename: 'ActorConnection',
    edges: ids.map(id => ({ __typename: 'ActorEdge', node: vc(id) })),
    pageInfo: { __typename: 'PageInfo', hasNextPage: endCursor !== null, endCursor },
  },
});

function setup(replies: Array<Record<string, unknown>>) {
  const requests: Array<Record<string, unknown>> = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          requests.push(operation.variables);
          const reply = replies.shift();
          const timer = setTimeout(() => {
            if (!reply) observer.error(new Error('Unexpected request'));
            else {
              observer.next({ data: reply });
              observer.complete();
            }
          }, 0);
          return () => clearTimeout(timer);
        })
    ),
  });
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={client}>{children}</ApolloProvider>;
  const { result } = renderHook(() => useVirtualContributorsAdmin({ spaceId: 'space-1' }), { wrapper });
  return { result, requests };
}

describe('useVirtualContributorsAdmin — candidates(actorType: virtual_contributor)', () => {
  it('account VCs read every DIRECT page with the search terms', async () => {
    const fixture = setup([page(['vc-1'], 'c-1'), page(['vc-2'], null)]);

    const found = await inAct(() => fixture.result.current.virtualContributorAdmin.getAvailable('bot'));

    expect(fixture.requests).toEqual([
      { space: 'space-1', role: 'member', entry: 'DIRECT', actorType: 'virtual_contributor', terms: 'bot', first: 100 },
      {
        space: 'space-1',
        role: 'member',
        entry: 'DIRECT',
        actorType: 'virtual_contributor',
        terms: 'bot',
        first: 100,
        after: 'c-1',
      },
    ]);
    expect(found).toEqual([
      { id: 'vc-1', actorType: 'virtual_contributor', displayName: 'vc-1', description: 'About vc-1', tags: ['kb'] },
      { id: 'vc-2', actorType: 'virtual_contributor', displayName: 'vc-2', description: 'About vc-2', tags: ['kb'] },
    ]);
  });

  it('library VCs are the INVITE list; no terms when the search is empty', async () => {
    const fixture = setup([page(['vc-lib'], null)]);

    const found = await inAct(() => fixture.result.current.virtualContributorAdmin.getAvailableInLibrary(undefined));

    expect(fixture.requests).toEqual([
      { space: 'space-1', role: 'member', entry: 'INVITE', actorType: 'virtual_contributor', first: 100 },
    ]);
    expect(found.map(c => c.id)).toEqual(['vc-lib']);
  });

  it('fails instead of truncating when a continuation does not advance', async () => {
    const fixture = setup([page(['vc-1'], 'c-1'), page(['vc-1'], 'c-1')]);

    await expect(inAct(() => fixture.result.current.virtualContributorAdmin.getAvailable(undefined))).rejects.toThrow(
      'candidates continuation did not advance its cursor'
    );
  });
});
