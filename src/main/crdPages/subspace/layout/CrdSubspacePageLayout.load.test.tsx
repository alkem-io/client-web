import { ApolloClient, ApolloLink, ApolloProvider, Observable, type Operation } from '@apollo/client';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { Link, MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import type { SubspaceSidebar as SubspaceSidebarComponent } from '@/crd/components/space/SubspaceSidebar';
import SubspaceContextProvider from '@/domain/space/context/SubspaceContext';
import { UrlResolverProvider } from '@/main/routing/urlResolver/UrlResolverProvider';
import CrdSubspacePageLayout from './CrdSubspacePageLayout';

type SidebarProps = ComponentProps<typeof SubspaceSidebarComponent>;
let desktopSidebar: SidebarProps | undefined;

// The page's own data path is real (D1 resolver, SubspaceContext, useCrdSubspace, useSpacePageLoad, the collapse
// state); the other packages' widgets and dialogs are stand-ins.
vi.mock('@/core/auth/authentication/context/AuthenticationProvider', async () => {
  const { createContext } = await import('react');
  return { AuthenticationContext: createContext({ isAuthenticated: true }) };
});
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated: true }),
}));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/core/routing/usePageTitle', () => ({ usePageTitle: () => {} }));
vi.mock('@/crd/hooks/useEdgeSwipe', () => ({ useEdgeSwipe: () => {} }));
vi.mock('@/crd/hooks/useMediaQuery', () => ({ useMediaQuery: () => false }));
vi.mock('@/crd/components/common/LoadingSpinner', () => ({ LoadingSpinner: () => null }));
vi.mock('@/crd/components/common/ShareDialog', () => ({ ShareDialog: () => null }));
vi.mock('@/crd/components/space/CommunityUpdatesDialog', () => ({ CommunityUpdatesDialog: () => null }));
vi.mock('@/crd/components/space/HeaderActionIcons', () => ({ HeaderActionIcons: () => null }));
vi.mock('@/crd/components/space/SpaceVisibilityNotice', () => ({ SpaceVisibilityNotice: () => null }));
vi.mock('@/crd/components/space/SubspaceHeader', () => ({ SubspaceHeader: () => null }));
vi.mock('@/crd/components/space/SubspaceSidebar', () => ({
  SubspaceSidebar: (props: SidebarProps) => {
    if (props.onToggleCollapse) desktopSidebar = props;
    return null;
  },
}));
vi.mock('@/crd/components/space/sidebar/UpdatesSection', () => ({ UpdatesSection: () => null }));
vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  StorageConfigContextProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/subspaces/CreateSubspaceDialogs', () => ({
  CreateSubspaceDialogs: () => null,
}));
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace', () => ({
  useCreateSubspace: () => ({ openDialog: vi.fn() }),
}));
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/useVisibleSettingsTabs', () => ({
  getVisibleSettingsTabs: () => [],
  useSettingsTabDescriptors: () => [],
}));
vi.mock('@/main/ui/breadcrumbs/BreadcrumbsContext', () => ({ useSetBreadcrumbs: () => {} }));
vi.mock('@/main/ui/layout/BannerOverlayContext', () => ({ useEnableBannerOverlay: () => {} }));
vi.mock('@/main/ui/layout/LayoutWidthContext', () => ({ useEnableSpaceFullWidth: () => {} }));
vi.mock('@/main/ui/layout/useDownNoticeBanner', () => ({ useDownNoticeBanner: () => ({ visible: false }) }));
vi.mock('@/main/ui/layout/useLayoutWidthPreference', () => ({
  useLayoutWidthPreference: () => ({ wide: false, toggle: vi.fn() }),
}));
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard', () => ({
  useDirtyTabGuard: () => ({ requestSwitch: async () => true }),
}));
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab', () => ({
  useSpaceSettingsTab: () => ({ activeTab: 'about', setActiveTab: vi.fn() }),
}));
vi.mock('../../space/callout/CalloutFormConnector', () => ({ CalloutFormConnector: () => null }));
vi.mock('../../space/callout/CalloutShareOnAlkemioForm', () => ({ CalloutShareOnAlkemioForm: () => null }));
vi.mock('../../space/dialogs/CrdSpaceCommunityDialogConnector', () => ({
  CrdSpaceCommunityDialogConnector: () => null,
}));
vi.mock('../../space/dialogs/InviteMembersDialogConnector', () => ({ InviteMembersDialogConnector: () => null }));
vi.mock('../../space/dialogs/SubspacesDialogConnector', () => ({ SubspacesDialogConnector: () => null }));
vi.mock('../../space/hooks/useCrdCommunityUpdates', () => ({
  useCrdCommunityUpdates: () => ({ latest: undefined, total: 0, updates: [], loading: false }),
}));
vi.mock('../../space/hooks/useCrdSpaceLocale', () => ({ useCrdSpaceLocale: () => undefined }));
vi.mock('../../space/hooks/useSidebarFlowStateSearch', () => ({
  useSidebarFlowStateSearch: () => ({ section: undefined, isSearching: false }),
}));
vi.mock('../../space/SpaceApplyButtonConnector', () => ({ SpaceApplyButtonConnector: () => null }));
vi.mock('../../space/timeline/useCrdCalendarUrlState', () => ({
  useCrdCalendarUrlState: () => ({ isAnyCalendarRoute: false }),
}));
vi.mock('../about/CrdSubspaceAbout', () => ({ CrdSubspaceAbout: () => null }));
vi.mock('../dialogs/CrdSubspaceActivityDialogConnector', () => ({ CrdSubspaceActivityDialogConnector: () => null }));
vi.mock('../dialogs/CrdSubspaceEventsDialogConnector', () => ({ CrdSubspaceEventsDialogConnector: () => null }));
vi.mock('../dialogs/CrdSubspaceIndexDialogConnector', () => ({ CrdSubspaceIndexDialogConnector: () => null }));

// ---- 021 D1 / D2 responses -----------------------------------------------------

const PATH = '/root/challenges/l1';
const stages = [
  { __typename: 'Stage', id: 'stage-a', name: 'Explore', description: null, sortOrder: 1 },
  { __typename: 'Stage', id: 'stage-b', name: 'Build', description: null, sortOrder: 2 },
];
let sidebar: string[] = [];
let createSubspace = false;
// The resolved subspace; a not-served case takes its own id (the not-served tree memo is per space, module-level).
let spaceId = 'l1';
let treeServed = true;

const inputs = () => ({
  __typename: 'Space',
  id: spaceId,
  entityType: 'space',
  kind: 'SPACE',
  depth: 1,
  url: PATH,
  settings: { subspace_sidebar: sidebar },
  stages: stages.map(({ id, sortOrder }) => ({ __typename: 'Stage', id, sortOrder })),
});
const about = (name: string) => ({
  __typename: 'About',
  displayName: name,
  tagline: null,
  avatar: null,
  card: null,
  banner: null,
});
const resolution = () => ({
  __typename: 'ResolveResult',
  matchedPrefix: PATH,
  remainder: [],
  state: 'OK',
  node: inputs(),
  ancestors: [
    {
      __typename: 'Space',
      id: 'root',
      entityType: 'space',
      kind: 'SPACE',
      depth: 0,
      url: '/root',
      about: about('Root'),
    },
  ],
  closestReadable: null,
  space: inputs(),
  homepage: null,
});
const flags = ['read', 'update', 'delete', 'archive', 'createPost', 'createSubspace', 'createDocument', 'invite'];
const spaceDocument = () => ({
  ...inputs(),
  handle: 'l1',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  tags: [],
  isContentPublic: true,
  videoCallUrl: null,
  memberCount: 1,
  about: { ...about('Subspace'), description: null, location: null, facets: [] },
  links: [],
  classifications: [],
  guidelines: null,
  applicationForm: null,
  host: null,
  leads: [],
  stages,
  membership: null,
  parent: null,
  entitlements: [],
  can: {
    __typename: 'SpaceCan',
    ...Object.fromEntries(
      [...flags, 'manageMembers', 'manageTemplates', 'upload', 'readActivity', 'saveAsTemplate', 'join', 'apply'].map(
        flag => [flag, flag === 'read' || (flag === 'createSubspace' && createSubspace)]
      )
    ),
  },
});
// A child space's face row in the space tree (NativeSubspaceCard).
const childSpace = {
  __typename: 'Space',
  id: 'c1',
  entityType: 'space',
  url: `${PATH}/opportunities/c1`,
  status: 'ACTIVE',
  isContentPublic: true,
  pinned: false,
  tags: [],
  about: { __typename: 'About', displayName: 'Child one', tagline: null, avatar: null, card: null },
  membership: null,
  can: { __typename: 'SpaceCan', read: true },
  leads: [],
};
const pageInfo = { __typename: 'PageInfo', hasNextPage: false, endCursor: null };
const NOT_SERVED = {
  errors: [
    { message: 'Unknown argument "stopAt"', extensions: { code: 'VALIDATION' }, locations: [{ line: 1, column: 1 }] },
  ],
};

function setup(initialPath = PATH) {
  const sent: Operation[] = [];
  const client = new ApolloClient({
    cache: createV2Cache(),
    link: new ApolloLink(
      operation =>
        new Observable(observer => {
          sent.push(operation);
          const v = operation.variables;
          const tree = {
            __typename: 'NodeConnection',
            edges: [{ __typename: 'NodeEdge', cursor: 'c1', node: childSpace }],
            pageInfo,
            totalCount: 1,
          };
          const reply =
            operation.operationName === 'NativeRouteResolution'
              ? { data: { resolve: resolution() } }
              : operation.operationName === 'SpaceTree'
                ? treeServed
                  ? { data: { tree } }
                  : NOT_SERVED
                : { data: { ...(v.withSpace && { node: spaceDocument() }) } };
          setTimeout(() => {
            observer.next(reply);
            observer.complete();
          }, 0);
        })
    ),
  });
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ApolloProvider client={client}>
        <UrlResolverProvider>
          <SubspaceContextProvider>
            <Link to="?phase=stage-b">phase b</Link>
            <CrdSubspacePageLayout />
          </SubspaceContextProvider>
        </UrlResolverProvider>
      </ApolloProvider>
    </MemoryRouter>
  );
  return sent;
}

const shape = (operation: Operation) => [
  operation.operationName,
  ...Object.entries(operation.variables)
    .filter(([name, value]) => name.startsWith('with') && value === true)
    .map(([name]) => name),
];
const settle = () => act(() => new Promise(resolve => setTimeout(resolve, 20)));
const renderRealSidebar = async () => {
  const { SubspaceSidebar } = await vi.importActual<typeof import('@/crd/components/space/SubspaceSidebar')>(
    '@/crd/components/space/SubspaceSidebar'
  );
  // biome-ignore lint/style/noNonNullAssertion: the caller waited for the layout's sidebar
  render(<SubspaceSidebar {...desktopSidebar!} collapsed={false} />);
};

describe('CrdSubspacePageLayout page request (021 FR-003/FR-005, T020)', () => {
  beforeEach(() => {
    sidebar = ['intent', 'subspaceLinks'];
    createSubspace = false;
    spaceId = 'l1';
    treeServed = true;
    desktopSidebar = undefined;
    window.localStorage.clear();
  });
  afterEach(() => window.localStorage.clear());

  test('cold = [NativeRouteResolution, SpacePage, SpaceTree]: the links read the space tree, a toggle sends nothing', async () => {
    window.localStorage.setItem('menuState', 'collapsed');
    const sent = setup();
    await waitFor(() => expect(desktopSidebar?.subspaces).toHaveLength(1));
    expect(sent.map(shape)).toEqual([['NativeRouteResolution'], ['SpacePage', 'withSpace'], ['SpaceTree']]);
    expect(sent[2].variables).toEqual({ space: 'l1', treeFirst: 500 });

    // expand, collapse again: the tree is cached
    act(() => desktopSidebar?.onToggleCollapse?.());
    act(() => desktopSidebar?.onToggleCollapse?.());
    await settle();
    expect(sent).toHaveLength(3);
  });

  test('a phase switch sends nothing: a stage feed filters the cached space tree', async () => {
    sidebar = ['intent', 'updates'];
    const sent = setup();
    await waitFor(() => expect(sent).toHaveLength(3));
    expect(sent.map(shape)).toEqual([['NativeRouteResolution'], ['SpacePage', 'withSpace'], ['SpaceTree']]);

    fireEvent.click(screen.getByText('phase b'));
    await settle();
    expect(sent).toHaveLength(3);
  });

  test('a cold ?phase URL is the same one SpacePage and one space tree', async () => {
    sidebar = [];
    const sent = setup(`${PATH}?phase=stage-a`);
    await waitFor(() => expect(sent).toHaveLength(3));
    expect(sent.map(shape)).toEqual([['NativeRouteResolution'], ['SpacePage', 'withSpace'], ['SpaceTree']]);
  });

  test('without the create verdict one readable child shows the links widget without Create', async () => {
    sidebar = ['subspaceLinks', 'createSubspace'];
    const sent = setup();
    await waitFor(() => expect(desktopSidebar?.subspaces).toHaveLength(1));
    expect(desktopSidebar?.widgets).toContain('subspaceLinks');
    expect(desktopSidebar?.onCreateSubspace).toBeUndefined();

    await renderRealSidebar();
    expect(screen.getByText('Child one')).toBeInTheDocument();
    expect(screen.getByText('sidebar.showAll')).toBeInTheDocument();
    expect(screen.queryByText('subspaces.createSubspace')).not.toBeInTheDocument();
    expect(sent).toHaveLength(3);
  });

  test('with the create verdict the create-subspace widget and callback follow it', async () => {
    sidebar = ['subspaceLinks', 'createSubspace'];
    createSubspace = true;
    setup();
    await waitFor(() => expect(desktopSidebar?.onCreateSubspace).toBeTypeOf('function'));
    await renderRealSidebar();
    expect(screen.getByText('Child one')).toBeInTheDocument();
    expect(screen.getByText('subspaces.createSubspace')).toBeInTheDocument();
  });

  test('a space tree the server does not serve yet: the links widget says so in place, asked once', async () => {
    spaceId = 'l1-tree-not-served';
    treeServed = false;
    const sent = setup();
    await waitFor(() => expect(desktopSidebar?.subspacesUnavailableMessage).toBe('tabs.unavailable'));
    expect(desktopSidebar?.subspaces).toEqual([]);
    await renderRealSidebar();
    expect(screen.getByText('tabs.unavailable')).toBeInTheDocument();
    await settle();
    expect(sent.map(shape)).toEqual([['NativeRouteResolution'], ['SpacePage', 'withSpace'], ['SpaceTree']]);
  });
});
