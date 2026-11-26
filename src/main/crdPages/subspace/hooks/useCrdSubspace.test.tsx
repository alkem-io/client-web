import { ApolloClient, ApolloLink, ApolloProvider, Observable } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import {
  NativeRouteResolutionDocument,
  SpacePageDocument,
  SpaceTreeDocument,
} from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { getInitials } from '@/crd/lib/getInitials';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import SubspaceContextProvider from '@/domain/space/context/SubspaceContext';
import { spacePageVariables, spaceTreeVariables } from '@/domain/space/hooks/useSpacePage';
import { UrlResolverProvider } from '@/main/routing/urlResolver/UrlResolverProvider';
import { mapInnovationFlowPhases, mapSubspaceBanner, mapSubspaceSidebar } from '../dataMappers/subspacePageDataMapper';
import { useCrdSubspace } from './useCrdSubspace';

vi.mock('@/core/auth/authentication/context/AuthenticationProvider', async () => {
  const { createContext } = await import('react');
  return { AuthenticationContext: createContext({ isAuthenticated: true }) };
});

// ---- 021 D1 / D2 fixtures ----------------------------------------------------

const file = (url: string) => ({ __typename: 'File', id: `file${url}`, url });
const ref = (url: string) => ({ __typename: 'FileRef', alt: `alt${url}`, file: file(url) });

const face = (id: string, depth: number, banner: unknown = { ...ref(`/banner-${id}`), aspectRatio: 7 }) => ({
  __typename: 'Space',
  id,
  entityType: 'space',
  kind: 'SPACE',
  depth,
  url: `/${id}`,
  about: {
    __typename: 'About',
    displayName: `Space ${id}`,
    tagline: `Tagline ${id}`,
    avatar: ref(`/avatar-${id}`),
    card: ref(`/card-${id}`),
    banner,
  },
});

const stages = [
  { __typename: 'Stage', id: 'stage-b', name: 'Build', description: 'Second', sortOrder: 2 },
  { __typename: 'Stage', id: 'stage-a', name: 'Explore', description: null, sortOrder: 1 },
];

type Settings = { subspace_sidebar?: string[]; sort_mode?: string };

const resolution = (id: string, depth: number, ancestors: unknown[], settings: Settings) => {
  const inputs = {
    __typename: 'Space',
    id,
    entityType: 'space',
    kind: 'SPACE',
    depth,
    url: `/${id}`,
    settings,
    stages: stages.map(({ id: stageId, sortOrder }) => ({ __typename: 'Stage', id: stageId, sortOrder })),
  };
  return {
    __typename: 'ResolveResult',
    matchedPrefix: `/${id}`,
    remainder: [],
    state: 'OK',
    node: inputs,
    ancestors,
    closestReadable: null,
    space: inputs,
    homepage: null,
  };
};

const actor = (typename: string, id: string, actorType: string) => ({
  __typename: typename,
  id,
  actorType,
  url: `/${actorType}/${id}`,
  about: {
    __typename: 'About',
    displayName: `Actor ${id}`,
    avatar: { __typename: 'FileRef', alt: null, file: { __typename: 'File', url: `/a-${id}` } },
    location: { city: 'Delft', country: 'NL' },
  },
});

const can = (flags: Record<string, boolean>) => ({
  __typename: 'SpaceCan',
  ...Object.fromEntries(
    [
      'read',
      'update',
      'delete',
      'archive',
      'createPost',
      'createSubspace',
      'createDocument',
      'invite',
      'manageMembers',
      'manageTemplates',
      'upload',
      'readActivity',
      'saveAsTemplate',
      'join',
      'apply',
    ].map(flag => [flag, flags[flag] ?? false])
  ),
});

const spaceDocument = (id: string, depth: number, settings: Settings, overrides: Record<string, unknown> = {}) => ({
  ...face(id, depth),
  handle: `handle-${id}`,
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  tags: ['t1'],
  isContentPublic: true,
  settings,
  videoCallUrl: null,
  memberCount: 4,
  about: {
    ...face(id, depth).about,
    description: `Description ${id}`,
    location: null,
    facets: [],
    banner: null,
  },
  links: [],
  classifications: [],
  guidelines: null,
  applicationForm: null,
  host: null,
  leads: [actor('User', 'u1', 'user'), actor('Organization', 'o1', 'organization')],
  stages,
  membership: { __typename: 'Membership', roles: [], status: 'NONE', request: null },
  parent: null,
  entitlements: [],
  can: can({ read: true, update: true, createPost: true, createSubspace: true }),
  ...overrides,
});

// A child space's face row in the space tree (NativeSubspaceCard).
const child = (id: string, pinned: boolean) => ({
  __typename: 'Space',
  id,
  entityType: 'space',
  url: `/child-${id}`,
  status: 'ACTIVE',
  isContentPublic: false,
  pinned,
  tags: [],
  about: {
    __typename: 'About',
    displayName: `Child ${id}`,
    tagline: null,
    avatar: { __typename: 'FileRef', file: { __typename: 'File', url: `/child-avatar-${id}` } },
    card: null,
  },
  membership: null,
  can: { __typename: 'SpaceCan', read: true },
  leads: [],
});

type Fixture = {
  id: string;
  depth: number;
  ancestors: unknown[];
  settings?: Settings;
  document?: Record<string, unknown>;
  /** The space tree's child spaces (served, default none), or the tree the server does not serve yet. */
  children?: ReturnType<typeof child>[] | 'not served';
};

const NOT_SERVED = {
  errors: [
    { message: 'Unknown argument "stopAt"', extensions: { code: 'VALIDATION' }, locations: [{ line: 1, column: 1 }] },
  ],
};

function renderSubspace({ id, depth, ancestors, settings = {}, document = {}, children = [] }: Fixture) {
  const sent: string[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push(operation.operationName);
          if (operation.operationName === 'SpaceTree' && children === 'not served') {
            observer.next(NOT_SERVED);
            observer.complete();
          }
        })
    ),
  });
  const path = `/${id}`;
  client.writeQuery({
    query: NativeRouteResolutionDocument,
    variables: { url: new URL(path, globalThis.location.origin).href },
    data: { resolve: resolution(id, depth, ancestors, settings) },
  });
  client.writeQuery({
    query: SpacePageDocument,
    variables: spacePageVariables(id, ['space']),
    data: { node: spaceDocument(id, depth, settings, document) },
  });
  // The page's space tree, cached by its sections (served by default).
  if (children !== 'not served') {
    client.writeQuery({
      query: SpaceTreeDocument,
      variables: spaceTreeVariables(id),
      data: {
        tree: {
          __typename: 'NodeConnection',
          edges: children.map(node => ({ __typename: 'NodeEdge', cursor: node.id, node })),
          pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: null },
          totalCount: children.length,
        },
      },
    });
  }
  const wrapper = ({ children: content }: PropsWithChildren) => (
    <MemoryRouter initialEntries={[path]}>
      <ApolloProvider client={client}>
        <UrlResolverProvider>
          <SubspaceContextProvider>{content}</SubspaceContextProvider>
        </UrlResolverProvider>
      </ApolloProvider>
    </MemoryRouter>
  );
  return { sent, ...renderHook(() => useCrdSubspace(), { wrapper }) };
}

// ---- the legacy computations on the equivalent legacy fixtures ----------------

type LegacyProfile = {
  displayName: string;
  tagline: string;
  url: string;
  description?: string;
  avatar: { uri: string };
  cardBanner: { uri: string };
  banner?: { uri: string; alternativeText: string; aspectRatio: number };
};
const legacyProfile = (id: string): LegacyProfile => ({
  displayName: `Space ${id}`,
  tagline: `Tagline ${id}`,
  url: `/${id}`,
  avatar: { uri: `/avatar-${id}` },
  cardBanner: { uri: `/card-${id}` },
  banner: { uri: `/banner-${id}`, alternativeText: `alt/banner-${id}`, aspectRatio: 7 },
});
// C:main/crdPages/subspace/hooks/useCrdSubspace.ts:194-208 (71f8ddcf7)
const legacyStackItem = (id: string, profile: LegacyProfile) => ({
  name: profile.displayName,
  initials: getInitials(profile.displayName),
  href: profile.url,
  bannerUrl: profile.cardBanner.uri,
  color: pickColorFromId(id),
  tagline: profile.tagline,
});
// C:main/crdPages/subspace/layout/CrdSubspacePageLayout.tsx:189-209 (71f8ddcf7): L0 card banner, L1 parent avatar.
const legacyHop = (profile: LegacyProfile, image: 'avatar' | 'cardBanner') => ({
  label: profile.displayName,
  href: profile.url,
  avatar: { src: profile[image].uri, initials: getInitials(profile.displayName) },
});
const legacyLead = (id: string, type: string) => ({
  id,
  profile: {
    displayName: `Actor ${id}`,
    avatar: { uri: `/a-${id}` },
    url: `/${type}/${id}`,
    location: { city: 'Delft', country: 'NL' },
  },
});
const legacySidebar = (id: string) =>
  mapSubspaceSidebar({
    description: `Description ${id}`,
    leadUsers: [legacyLead('u1', 'user')],
    leadOrganizations: [legacyLead('o1', 'organization')],
  });
const legacyPhases = mapInnovationFlowPhases([
  { id: 'stage-a', displayName: 'Explore', description: null },
  { id: 'stage-b', displayName: 'Build', description: 'Second' },
]);

describe('useCrdSubspace (021 T019, from D1 and D2 only)', () => {
  test('L1 parity with the legacy mappers, and no request of its own', async () => {
    const { result, sent } = renderSubspace({ id: 'l1', depth: 1, ancestors: [face('root', 0)] });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banner).toEqual(
      mapSubspaceBanner({
        subspaceProfile: legacyProfile('l1'),
        levelZeroSpaceId: 'root',
        levelZeroProfile: legacyProfile('root'),
      })
    );
    expect(result.current.parentSpaceStack).toEqual([legacyStackItem('root', legacyProfile('root'))]);
    expect(result.current.ancestorCrumbs).toEqual([legacyHop(legacyProfile('root'), 'cardBanner')]);
    expect(result.current.sidebar).toEqual(legacySidebar('l1'));
    expect(result.current.phases).toEqual(legacyPhases);
    expect(result.current.subspaceAvatarUrl).toBe('/avatar-l1');
    expect(sent).toEqual([]);
  });

  test('L2 parity: L0 card banner and L1 avatar hops, the root banner', async () => {
    const { result } = renderSubspace({ id: 'l2', depth: 2, ancestors: [face('root', 0), face('l1', 1)] });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banner).toEqual(
      mapSubspaceBanner({
        subspaceProfile: legacyProfile('l2'),
        levelZeroSpaceId: 'root',
        levelZeroProfile: legacyProfile('root'),
      })
    );
    expect(result.current.parentSpaceStack).toEqual([
      legacyStackItem('root', legacyProfile('root')),
      legacyStackItem('l1', legacyProfile('l1')),
    ]);
    expect(result.current.ancestorCrumbs).toEqual([
      legacyHop(legacyProfile('root'), 'cardBanner'),
      legacyHop(legacyProfile('l1'), 'avatar'),
    ]);
    expect(result.current.level).toBe('L2');
  });

  test('depth 3: the root banner and three crumbs, root-first', async () => {
    const { result } = renderSubspace({
      id: 'l3',
      depth: 3,
      ancestors: [face('root', 0), face('l1', 1), face('l2', 2)],
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banner).toMatchObject({ title: 'Space l3', bannerUrl: '/banner-root', bannerAspectRatio: 7 });
    expect(result.current.ancestorCrumbs.map(crumb => [crumb.label, crumb.avatar?.src])).toEqual([
      ['Space root', '/card-root'],
      ['Space l1', '/avatar-l1'],
      ['Space l2', '/avatar-l2'],
    ]);
    expect(result.current.parentSpaceStack.map(item => item.href)).toEqual(['/root', '/l1', '/l2']);
  });

  test('a masked root banner shows the gradient of the root id', async () => {
    const { result } = renderSubspace({ id: 'l1', depth: 1, ancestors: [face('root', 0, null)] });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banner.bannerUrl).toBeUndefined();
    expect(result.current.banner.color).toBe(pickColorFromId('root'));
  });

  test('a chain returned without a depth-0 ancestor shows no root banner and only the returned crumbs', async () => {
    const { result } = renderSubspace({ id: 'l3', depth: 3, ancestors: [face('l2', 2)] });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.banner.bannerUrl).toBeUndefined();
    expect(result.current.banner.color).toBe(pickColorFromId(''));
    expect(result.current.levelZeroSpaceId).toBeUndefined();
    expect(result.current.ancestorCrumbs.map(crumb => crumb.label)).toEqual(['Space l2']);
    expect(result.current.parentSpaceStack.map(item => item.name)).toEqual(['Space l2']);
  });

  test('the status notice follows the space own status', async () => {
    const { result } = renderSubspace({
      id: 'l1',
      depth: 1,
      ancestors: [face('root', 0)],
      document: { status: 'ARCHIVED' },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.visibility).toEqual({ status: 'archived' });
  });

  test('the sidebar plan is settings.subspace_sidebar with the subspace vocabulary at every depth', async () => {
    const { result } = renderSubspace({
      id: 'l2',
      depth: 2,
      ancestors: [face('root', 0), face('l1', 1)],
      settings: { subspace_sidebar: ['intent', 'guidelines', 'subspaceLinks', 'createSubspace', 'intent', 'updates'] },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sidebarPlan).toEqual(['intent', 'subspaceLinks', 'createSubspace', 'updates']);
    expect(result.current.sidebarSkips.subspaceLinks).toBe(false);
  });

  test('without the create verdict a readable child still lists, pinned per sort_mode', async () => {
    const { result } = renderSubspace({
      id: 'l1',
      depth: 1,
      ancestors: [face('root', 0)],
      settings: { subspace_sidebar: ['subspaceLinks'], sort_mode: 'alphabetical' },
      document: { can: can({ read: true }) },
      children: [child('c1', true)],
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canCreateSubspace).toBe(false);
    expect(result.current.canCreateCallout).toBe(false);
    expect(result.current.subspaces).toEqual([
      {
        name: 'Child c1',
        initials: 'CC',
        href: '/child-c1',
        avatarUrl: '/child-avatar-c1',
        isPrivate: true,
        isPinned: true,
      },
    ]);
    expect(result.current.subspacesUnavailable).toBe(false);
  });

  test('a space tree the server does not serve yet: the subspaces widget says so, asked once', async () => {
    const { result, sent } = renderSubspace({
      id: 'l1-tree-not-served',
      depth: 1,
      ancestors: [face('root', 0)],
      settings: { subspace_sidebar: ['subspaceLinks'] },
      children: 'not served',
    });
    await waitFor(() => expect(result.current.subspacesUnavailable).toBe(true));
    expect(result.current.subspaces).toEqual([]);
    expect(sent).toEqual(['SpaceTree']);
  });
});
