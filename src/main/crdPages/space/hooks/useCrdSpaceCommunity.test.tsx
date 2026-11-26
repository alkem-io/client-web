import { ApolloClient, ApolloLink, ApolloProvider, Observable, type Operation } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import { SpacePageDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import { spacePageVariables } from '@/domain/space/hooks/useSpacePage';
import { useCrdSpaceCommunity } from './useCrdSpaceCommunity';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en', exists: () => false } }),
}));
let entitlements: string[] = [];
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    space: {
      id: 'space',
      about: { membership: { roleSetID: 'space', communityID: 'space' }, guidelines: { id: 'space' } },
    },
    permissions: { canUpdate: true },
    entitlements,
  }),
}));

const face = (id: string, actorType: string) => ({
  __typename: 'User',
  id,
  actorType,
  url: `/${id}`,
  about: { __typename: 'About', displayName: id, avatar: null, location: null },
});
const vcs = (from: number, to: number, hasNextPage: boolean) => ({
  __typename: 'MemberConnection',
  edges: Array.from({ length: to - from }, (_, offset) => ({
    __typename: 'MemberEdge',
    cursor: `c${from + offset + 1}`,
    node: {
      __typename: 'Member',
      id: `m${from + offset + 1}`,
      actor: face(`vc-${from + offset + 1}`, 'virtual_contributor'),
    },
  })),
  pageInfo: { __typename: 'PageInfo', hasNextPage, endCursor: `c${to}` },
});
const can = Object.fromEntries(
  ['read', 'update', 'delete', 'archive', 'createPost', 'createSubspace', 'createDocument', 'invite']
    .concat(['manageMembers', 'manageTemplates', 'upload', 'readActivity', 'saveAsTemplate', 'join', 'apply'])
    .map(flag => [flag, false])
);
const node = {
  __typename: 'Space',
  id: 'space',
  entityType: 'space',
  handle: 'space',
  url: '/space',
  depth: 0,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  tags: [],
  isContentPublic: true,
  settings: null,
  videoCallUrl: null,
  memberCount: null,
  about: {
    __typename: 'About',
    displayName: 'Space',
    tagline: null,
    description: null,
    location: null,
    facets: [],
    avatar: null,
    banner: null,
    card: null,
  },
  guidelines: { displayName: 'Rules', description: 'Be kind' },
  applicationForm: null,
  host: null,
  leads: [face('lead-user', 'user'), face('lead-org', 'organization')],
  stages: [],
  membership: null,
  parent: null,
  entitlements: [],
  can: { __typename: 'SpaceCan', ...can },
};

// The members read the server does not serve yet: its schema validation refuses it (no field path).
const NOT_SERVED = {
  errors: [{ message: 'not served', extensions: { code: 'VALIDATION' }, locations: [{ line: 1, column: 1 }] }],
};

function setup({ served = true } = {}) {
  const sent: Operation[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push(operation);
          const page = operation.variables.after ? vcs(500, 501, false) : vcs(0, 500, true);
          observer.next(served ? { data: { members: page } } : NOT_SERVED);
          observer.complete();
        })
    ),
  });
  client.writeQuery({
    query: SpacePageDocument,
    variables: spacePageVariables('space', ['space']),
    data: { node },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <ApolloProvider client={client}>
      <GlobalStateProvider>{children}</GlobalStateProvider>
    </ApolloProvider>
  );
  return { sent, wrapper };
}

describe('useCrdSpaceCommunity (021 T009)', () => {
  test('leads and guidelines from the cached Space document; without the VC entitlement no members read', async () => {
    entitlements = [];
    const { sent, wrapper } = setup();
    const { result } = renderHook(() => useCrdSpaceCommunity(), { wrapper });
    expect(result.current.leadUsers.map(lead => lead.id)).toEqual(['lead-user']);
    expect(result.current.leadOrganizations.map(lead => lead.id)).toEqual(['lead-org']);
    expect(result.current.guidelines).toMatchObject({ id: 'space', displayName: 'Rules', description: 'Be kind' });
    await new Promise(resolve => setTimeout(resolve, 50));
    // without the VC entitlement the widget does not render, so its members are not read
    expect(result.current.virtualContributors).toEqual([]);
    expect(sent).toEqual([]);
  });

  test('with the VC entitlement, 501 virtual contributors show from the members read and one continuation', async () => {
    entitlements = [LicenseEntitlementType.SpaceFlagVirtualContributorAccess];
    const { sent, wrapper } = setup();
    const { result } = renderHook(() => useCrdSpaceCommunity(), { wrapper });
    await waitFor(() => expect(result.current.virtualContributors).toHaveLength(501));
    expect(result.current.virtualContributorsUnavailable).toBe(false);
    expect(sent.map(operation => [operation.operationName, operation.variables])).toEqual([
      ['SpaceVirtualContributors', { space: 'space', membersFirst: 500 }],
      ['SpaceVirtualContributors', { space: 'space', membersFirst: 500, after: 'c500' }],
    ]);
  });

  test('a members read the server does not serve yet: the widget is unavailable, asked once', async () => {
    entitlements = [LicenseEntitlementType.SpaceFlagVirtualContributorAccess];
    const { sent, wrapper } = setup({ served: false });
    const { result } = renderHook(() => useCrdSpaceCommunity(), { wrapper });
    await waitFor(() => expect(result.current.virtualContributorsUnavailable).toBe(true));
    expect(result.current.virtualContributors).toEqual([]);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(sent.map(operation => operation.operationName)).toEqual(['SpaceVirtualContributors']);
  });
});
