import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import { print } from 'graphql';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CommunityMembershipStatus, SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { SpacePageDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { type NativeRouteResolutionQuery, ResolveState, SpaceKind } from '@/core/apollo/generated-v2/graphql-schema';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { spacePageVariables } from '@/domain/space/hooks/useSpacePage';

const resolver = vi.fn();
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({ default: () => resolver() }));

import { useSettingsScope } from '@/main/crdPages/topLevelPages/spaceSettings/useSettingsScope';
import { UrlResolverContext, type UrlResolverContextValue } from '@/main/routing/urlResolver/UrlResolverProvider';
import { SpaceContextProvider } from './SpaceContext';
import { useSpace } from './useSpace';

const space = (id: string, depth: number, overrides: Record<string, unknown> = {}) => ({
  __typename: 'Space',
  id,
  entityType: 'space',
  handle: `handle-${id}`,
  url: `/${id}`,
  depth,
  status: 'ARCHIVED',
  isContentPublic: false,
  tags: ['t1'],
  settings: { sort_mode: 'custom', permissions: { members_video_call: true } },
  videoCallUrl: 'https://meet.example/handle-root/room',
  about: {
    __typename: 'About',
    displayName: `Space ${id}`,
    tagline: 'Tagline',
    description: 'Description',
    avatar: null,
    banner: { __typename: 'FileRef', file: { __typename: 'File', url: '/banner' }, alt: 'Banner', aspectRatio: 8 },
    card: { __typename: 'FileRef', file: { __typename: 'File', url: '/card' }, alt: null },
  },
  can: {
    __typename: 'SpaceCan',
    read: true,
    update: true,
    createSubspace: depth < 2,
    manageTemplates: true,
    saveAsTemplate: false,
  },
  membership: { __typename: 'Membership', status: 'MEMBER' },
  entitlements: [{ __typename: 'Entitlement', name: 'space-flag-save-as-template' }],
  host: { __typename: 'Organization', id: 'host', account: { __typename: 'AccountSummary', id: 'account-1' } },
  ...overrides,
});

function setup(nodes: Record<string, ReturnType<typeof space>>, resolution?: NativeRouteResolutionQuery['resolve']) {
  const sent: Array<{ operationName: string; variables: Record<string, unknown>; query: string }> = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push({
            operationName: operation.operationName,
            variables: operation.variables,
            query: print(operation.query),
          });
          setTimeout(() => {
            observer.next({ data: { node: nodes[operation.variables.id as string] ?? null } });
            observer.complete();
          }, 0);
        })
    ),
  });
  // The route resolution is the one UrlResolverProvider holds, read from its context (useNativeRouteSpace).
  const wrapper = ({ children }: PropsWithChildren) => (
    <MemoryRouter initialEntries={['/child']}>
      <ApolloProvider client={client}>
        <UrlResolverContext value={{ resolution } as UrlResolverContextValue}>
          <SpaceContextProvider>{children}</SpaceContextProvider>
        </UrlResolverContext>
      </ApolloProvider>
    </MemoryRouter>
  );
  return { sent, wrapper, client };
}

// The full 021 D2 Space document of `space()`, as the page's SpacePage request writes it.
const spaceDocument = (id: string, depth: number, overrides: Record<string, unknown> = {}) => {
  const base = space(id, depth, overrides);
  const fileRef = (ref: { file: { url: string }; alt: string | null; aspectRatio?: number } | null) =>
    ref && { ...ref, file: { ...ref.file, id: `file-${ref.file.url}` }, aspectRatio: ref.aspectRatio ?? null };
  return {
    ...base,
    createdAt: '2026-01-01T00:00:00Z',
    memberCount: 3,
    about: {
      ...base.about,
      location: null,
      facets: [],
      banner: fileRef(base.about.banner),
      card: fileRef(base.about.card),
    },
    links: [],
    classifications: [],
    guidelines: null,
    applicationForm: null,
    host: {
      ...base.host,
      actorType: 'organization',
      url: '/org',
      about: { __typename: 'About', displayName: 'Host', avatar: null, location: null },
    },
    leads: [],
    stages: [],
    membership: { ...base.membership, roles: ['member'], request: null },
    parent: null,
    can: {
      ...base.can,
      delete: false,
      archive: false,
      createPost: true,
      createDocument: false,
      invite: false,
      manageMembers: false,
      upload: false,
      readActivity: false,
      join: false,
      apply: false,
    },
  };
};

describe('SpaceContext (021 D2 Space document, D1 root face)', () => {
  it('reads the level-zero Space document the page loaded, with no request of its own', async () => {
    resolver.mockReturnValue({ levelZeroSpaceId: 'root', spaceId: 'root', loading: false });
    const { sent, wrapper, client } = setup({});
    client.writeQuery({
      query: SpacePageDocument,
      variables: spacePageVariables('root', ['space']),
      data: { node: spaceDocument('root', 0) },
    });
    const { result } = renderHook(() => useSpace(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(sent).toHaveLength(0);
    expect(result.current.space).toMatchObject({
      id: 'root',
      nameID: 'handle-root',
      level: SpaceLevel.L0,
      accountId: 'account-1',
      about: {
        isContentPublic: false,
        membership: { myMembershipStatus: CommunityMembershipStatus.Member, roleSetID: 'root', communityID: 'root' },
        guidelines: { id: 'root' },
        profile: {
          displayName: 'Space root',
          url: '/root',
          tagline: 'Tagline',
          tagset: { tags: ['t1'] },
          banner: { uri: '/banner', alternativeText: 'Banner', aspectRatio: 8 },
          cardBanner: { uri: '/card' },
        },
      },
    });
    expect(result.current.visibility).toBe(SpaceVisibility.Archived);
    expect(result.current.permissions).toEqual({
      canRead: true,
      canUpdate: true,
      canCreateSubspaces: true,
      canCreateTemplates: true,
    });
    expect(result.current.entitlements).toEqual(['space-flag-save-as-template']);
    expect(result.current.videoCallUrl).toBe('https://meet.example/handle-root/room');
  });

  it('stays loading until the page has loaded the Space document', () => {
    resolver.mockReturnValue({ levelZeroSpaceId: 'root', spaceId: 'root', loading: false });
    const { sent, wrapper } = setup({});
    const { result } = renderHook(() => useSpace(), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(sent).toHaveLength(0);
  });

  it('on a subspace page carries the depth-0 ancestor face from the route resolution, no request', async () => {
    resolver.mockReturnValue({ levelZeroSpaceId: 'root', spaceId: 'child', loading: false });
    const { sent, wrapper } = setup(
      {},
      {
        __typename: 'ResolveResult',
        matchedPrefix: '/child',
        remainder: [],
        state: ResolveState.Ok,
        node: null,
        closestReadable: null,
        space: null,
        homepage: null,
        ancestors: [
          {
            __typename: 'Space',
            id: 'root',
            entityType: 'space',
            kind: SpaceKind.Space,
            depth: 0,
            url: '/root',
            about: {
              __typename: 'About',
              displayName: 'Root face',
              tagline: null,
              avatar: null,
              card: null,
              banner: null,
            },
          },
        ],
      }
    );
    const { result } = renderHook(() => useSpace(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(sent).toHaveLength(0);
    expect(result.current.space.about.profile).toMatchObject({ displayName: 'Root face', url: '/root' });
    expect(result.current.permissions.canRead).toBe(false);
  });
});

describe('useSettingsScope (native SpacePageShell at any depth)', () => {
  it('resolves a subspace from its own read: level from depth, Space.id as the membership resource, no account', async () => {
    resolver.mockReturnValue({ levelZeroSpaceId: 'root', spaceId: 'child', loading: false });
    const { sent, wrapper } = setup({ root: space('root', 0), child: space('child', 2) });
    const { result } = renderHook(() => useSettingsScope(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(sent.map(s => s.variables)).toEqual(expect.arrayContaining([{ id: 'child' }]));
    expect(result.current).toEqual({
      id: 'child',
      level: 'L2',
      url: '/child',
      roleSetId: 'child',
      communityId: 'child',
      guidelinesId: 'child',
      accountId: undefined,
      displayName: 'Space child',
      tagline: 'Tagline',
      canUpdate: true,
      canCreateSubspace: false,
      canSaveAsTemplate: false,
      loading: false,
    });
  });

  it('carries the hosting account at the top level', async () => {
    resolver.mockReturnValue({ levelZeroSpaceId: 'root', spaceId: 'root', loading: false });
    const { wrapper } = setup({ root: space('root', 0) });
    const { result } = renderHook(() => useSettingsScope(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ id: 'root', level: 'L0', accountId: 'account-1' });
  });

  it('stays loading while the URL resolver is still resolving', () => {
    resolver.mockReturnValue({ levelZeroSpaceId: undefined, spaceId: undefined, loading: true });
    const { sent, wrapper } = setup({});
    const { result } = renderHook(() => useSettingsScope(), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.id).toBe('');
    expect(sent).toHaveLength(0);
  });
});
