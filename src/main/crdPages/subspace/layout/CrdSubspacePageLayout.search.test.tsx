import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { SubspaceSidebarProps } from '@/crd/components/space/SubspaceSidebar';
import type { SidebarWidgetId } from '@/crd/components/space/settings/SpaceSettingsLayoutView.types';
import CrdSubspacePageLayout, { type SubspaceOutletContext } from './CrdSubspacePageLayout';

// ---- controllable state -----------------------------------------------------

let sidebarPlan: SidebarWidgetId[] = [];
let activePhaseId: string | undefined = 'phase-a';
let isAuthenticated = true;
let canUpdate = true;
let lastSidebarProps: SubspaceSidebarProps | undefined;
let lastOutletContext: SubspaceOutletContext | undefined;

const useFlowStateSearch = vi.fn(
  (_params: { flowStateID?: string; spaceID?: string; terms: string[]; skip?: boolean }) => ({
    status: 'idle' as const,
    results: [],
    appending: false,
    hasMore: false,
    sentinelRef: () => {},
    retry: () => {},
  })
);
const useCalloutsSetTagsQuery = vi.fn((_options: { skip?: boolean; variables: unknown }) => ({
  data: undefined,
  loading: false,
}));
const useCrdCommunityUpdates = vi.fn((_communityId: string | undefined, _skip?: boolean) => ({
  latest: undefined,
  total: 0,
  updates: [],
  loading: false,
}));
const inviteDialogMounts = vi.fn();

const deriveSkips = (plan: SidebarWidgetId[]) =>
  new Proxy({} as Record<SidebarWidgetId, boolean>, {
    get: (_target, key) => !plan.includes(key as SidebarWidgetId),
  });

const subspaceData = () => ({
  loading: false,
  notFound: false,
  subspaceId: 'L1-ID',
  subspaceName: 'Subspace',
  subspaceUrl: '/l0/l1',
  levelZeroSpaceId: 'L0-ID',
  parentSpaceId: 'L0-ID',
  communityId: 'community-1',
  calloutsSetId: 'callouts-set-1',
  collaborationId: 'collab-1',
  roleSetId: 'roleset-1',
  level: 'L1' as const,
  sidebarPlan,
  sidebarSkips: deriveSkips(sidebarPlan),
  sidebar: { description: '', leads: [] },
  parentSpaceStack: [],
  subspaces: [],
  phases: [
    { id: 'phase-a', label: 'Phase A' },
    { id: 'phase-b', label: 'Phase B' },
  ],
  currentPhaseId: 'phase-a',
  canEditFlow: false,
  canRead: true,
  canUpdate,
  canCreateSubspace: false,
  canCreateCallout: false,
  banner: { title: 'Subspace' },
  bannerActions: {},
  visibility: { status: 'active' },
});

// ---- module mocks -----------------------------------------------------------

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
vi.mock('react-router-dom', () => ({
  Outlet: ({ context }: { context: SubspaceOutletContext }) => {
    lastOutletContext = context;
    return null;
  },
  useLocation: () => ({ pathname: '/l0/l1' }),
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutsSetTagsQuery: (options: { skip?: boolean; variables: unknown }) => useCalloutsSetTagsQuery(options),
}));
vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated }),
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
  SubspaceSidebar: (props: SubspaceSidebarProps) => {
    // The desktop instance carries the collapse toggle; the drawer copy does not.
    if (props.onToggleCollapse) lastSidebarProps = props;
    return null;
  },
}));
vi.mock('@/crd/components/space/settings/SpaceSettingsHeader', () => ({ SpaceSettingsHeader: () => null }));
vi.mock('@/crd/components/space/settings/SpaceSettingsTabStrip', () => ({ SpaceSettingsTabStrip: () => null }));
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
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard', () => ({
  useDirtyTabGuard: () => ({ requestSwitch: async () => true }),
}));
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab', () => ({
  useSpaceSettingsTab: () => ({ activeTab: 'about', setActiveTab: vi.fn() }),
}));
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/useVisibleSettingsTabs', () => ({
  getVisibleSettingsTabs: () => [],
  useSettingsTabDescriptors: () => [],
}));
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({ default: () => ({ spaceLevel: 'L1' }) }));
vi.mock('@/main/ui/breadcrumbs/BreadcrumbsContext', () => ({ useSetBreadcrumbs: () => {} }));
vi.mock('@/main/ui/layout/BannerOverlayContext', () => ({ useEnableBannerOverlay: () => {} }));
vi.mock('@/main/ui/layout/LayoutWidthContext', () => ({ useEnableSpaceFullWidth: () => {} }));
vi.mock('@/main/ui/layout/useDownNoticeBanner', () => ({ useDownNoticeBanner: () => ({ visible: false }) }));
vi.mock('@/main/ui/layout/useLayoutWidthPreference', () => ({
  useLayoutWidthPreference: () => ({ wide: false, toggle: vi.fn() }),
}));
// No debounce in tests: the applied text follows the field immediately.
vi.mock('@/main/crdPages/utils/useDebouncedValue', () => ({ useDebouncedValue: <T,>(value: T) => value }));
vi.mock('../../space/callout/CalloutFormConnector', () => ({ CalloutFormConnector: () => null }));
vi.mock('../../space/callout/CalloutShareOnAlkemioForm', () => ({ CalloutShareOnAlkemioForm: () => null }));
vi.mock('../../space/dialogs/CrdSpaceCommunityDialogConnector', () => ({
  CrdSpaceCommunityDialogConnector: () => null,
}));
vi.mock('../../space/dialogs/InviteMembersDialogConnector', () => ({
  InviteMembersDialogConnector: (props: unknown) => {
    inviteDialogMounts(props);
    return null;
  },
}));
vi.mock('../../space/dialogs/SubspacesDialogConnector', () => ({ SubspacesDialogConnector: () => null }));
vi.mock('../../space/hooks/useCrdCommunityUpdates', () => ({
  useCrdCommunityUpdates: (communityId: string | undefined, skip?: boolean) =>
    useCrdCommunityUpdates(communityId, skip),
}));
vi.mock('../../space/hooks/useCrdSpaceLocale', () => ({ useCrdSpaceLocale: () => undefined }));
vi.mock('../../space/hooks/useFlowStateSearch', () => ({
  useFlowStateSearch: (params: { flowStateID?: string; spaceID?: string; terms: string[]; skip?: boolean }) =>
    useFlowStateSearch(params),
}));
vi.mock('../../space/SpaceApplyButtonConnector', () => ({ SpaceApplyButtonConnector: () => null }));
vi.mock('../../space/timeline/useCrdCalendarUrlState', () => ({
  useCrdCalendarUrlState: () => ({ isAnyCalendarRoute: false }),
}));
vi.mock('../about/CrdSubspaceAbout', () => ({ CrdSubspaceAbout: () => null }));
vi.mock('../dialogs/CrdSubspaceActivityDialogConnector', () => ({ CrdSubspaceActivityDialogConnector: () => null }));
vi.mock('../dialogs/CrdSubspaceEventsDialogConnector', () => ({ CrdSubspaceEventsDialogConnector: () => null }));
vi.mock('../dialogs/CrdSubspaceIndexDialogConnector', () => ({ CrdSubspaceIndexDialogConnector: () => null }));
vi.mock('../hooks/useCrdSubspace', () => ({ useCrdSubspace: () => subspaceData() }));
vi.mock('../hooks/useCrdSubspaceFlow', () => ({
  useCrdSubspaceFlow: () => ({ activePhaseId, setActivePhaseId: vi.fn() }),
}));
vi.mock('../hooks/useSubspaceSidebarCollapsed', () => ({
  useSubspaceSidebarCollapsed: () => ({ collapsed: false, toggle: vi.fn() }),
}));

// ---- tests --------------------------------------------------------------------

const lastSearchCall = () => useFlowStateSearch.mock.calls[useFlowStateSearch.mock.calls.length - 1][0];

describe('CrdSubspacePageLayout sidebar search', () => {
  beforeEach(() => {
    sidebarPlan = ['intent', 'search', 'index'];
    activePhaseId = 'phase-a';
    isAuthenticated = true;
    canUpdate = true;
    lastSidebarProps = undefined;
    lastOutletContext = undefined;
    useFlowStateSearch.mockClear();
    useCalloutsSetTagsQuery.mockClear();
    useCrdCommunityUpdates.mockClear();
    inviteDialogMounts.mockClear();
    // Switching phase scrolls to the top; jsdom does not implement scrollTo.
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  test('scopes the search to the level-zero space and the active phase, never the subspace id', () => {
    render(<CrdSubspacePageLayout />);
    act(() => lastSidebarProps?.search?.onTextChange('climate'));

    const call = lastSearchCall();
    expect(call).toMatchObject({ spaceID: 'L0-ID', flowStateID: 'phase-a', terms: ['climate'], skip: false });
    expect(useFlowStateSearch.mock.calls.every(([params]) => params.spaceID !== 'L1-ID')).toBe(true);
    expect(lastOutletContext?.search?.isSearching).toBe(true);
  });

  test('fetches the active phase tags for the search widget', () => {
    render(<CrdSubspacePageLayout />);
    const tagsCall = useCalloutsSetTagsQuery.mock.calls[useCalloutsSetTagsQuery.mock.calls.length - 1][0];
    expect(tagsCall.skip).toBe(false);
    expect(tagsCall.variables).toEqual({
      calloutsSetId: 'callouts-set-1',
      classificationTagsets: [{ name: 'FLOW_STATE', tags: ['Phase A'] }],
    });
  });

  test('switching phase clears the field and re-scopes to the new phase', () => {
    const { rerender } = render(<CrdSubspacePageLayout />);
    act(() => lastSidebarProps?.search?.onTextChange('climate'));
    expect(lastSearchCall().flowStateID).toBe('phase-a');

    activePhaseId = 'phase-b';
    rerender(<CrdSubspacePageLayout />);

    expect(lastSidebarProps?.search?.text).toBe('');
    expect(lastSearchCall()).toMatchObject({ flowStateID: 'phase-b', terms: [], skip: true });
    expect(lastOutletContext?.search?.isSearching).toBe(false);
  });

  test('without the search widget nothing is fetched and no search props reach the sidebar', () => {
    sidebarPlan = ['intent', 'index'];
    render(<CrdSubspacePageLayout />);
    expect(useFlowStateSearch.mock.calls.every(([params]) => params.skip === true)).toBe(true);
    expect(useCalloutsSetTagsQuery.mock.calls.every(([options]) => options.skip === true)).toBe(true);
    expect(lastSidebarProps?.search).toBeUndefined();
  });
});

describe('CrdSubspacePageLayout widget gates', () => {
  beforeEach(() => {
    isAuthenticated = true;
    canUpdate = true;
    lastSidebarProps = undefined;
    useCrdCommunityUpdates.mockClear();
    inviteDialogMounts.mockClear();
  });

  test('passes the configured plan to the sidebar', () => {
    sidebarPlan = ['community', 'search', 'index'];
    render(<CrdSubspacePageLayout />);
    expect(lastSidebarProps?.widgets).toEqual(['community', 'search', 'index']);
  });

  test('anonymous viewers never get Recent Activity', () => {
    sidebarPlan = ['activity'];
    isAuthenticated = false;
    render(<CrdSubspacePageLayout />);
    expect(lastSidebarProps?.activityEnabled).toBe(false);
  });

  test('signed-in viewers get Recent Activity when configured', () => {
    sidebarPlan = ['activity'];
    render(<CrdSubspacePageLayout />);
    expect(lastSidebarProps?.activityEnabled).toBe(true);
  });

  test('skips the latest-updates query when updates is not configured', () => {
    sidebarPlan = ['intent'];
    render(<CrdSubspacePageLayout />);
    expect(useCrdCommunityUpdates).toHaveBeenLastCalledWith('community-1', true);
  });

  test('fetches latest updates when updates is configured', () => {
    sidebarPlan = ['updates'];
    render(<CrdSubspacePageLayout />);
    expect(useCrdCommunityUpdates).toHaveBeenLastCalledWith('community-1', false);
  });

  test('addUser configured but no invite right: no Invite handler and no invite dialog', () => {
    sidebarPlan = ['addUser'];
    canUpdate = false;
    render(<CrdSubspacePageLayout />);
    expect(lastSidebarProps?.onInviteClick).toBeUndefined();
    expect(inviteDialogMounts).not.toHaveBeenCalled();
  });

  test('addUser configured with the invite right: invites target the subspace', () => {
    sidebarPlan = ['addUser'];
    render(<CrdSubspacePageLayout />);
    expect(lastSidebarProps?.onInviteClick).toBeTypeOf('function');
    expect(inviteDialogMounts).toHaveBeenCalledWith(expect.objectContaining({ spaceId: 'L1-ID' }));
  });
});

describe('CrdSubspacePageLayout scroll on phase change', () => {
  let scrollTo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sidebarPlan = [];
    activePhaseId = 'phase-a';
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    scrollTo.mockClear();
  });

  afterEach(() => {
    scrollTo.mockRestore();
  });

  test('switching phase scrolls to the top', () => {
    const { rerender } = render(<CrdSubspacePageLayout />);
    expect(scrollTo).not.toHaveBeenCalled();

    activePhaseId = 'phase-b';
    rerender(<CrdSubspacePageLayout />);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('the first phase resolving does not scroll', () => {
    activePhaseId = undefined;
    const { rerender } = render(<CrdSubspacePageLayout />);
    activePhaseId = 'phase-a';
    rerender(<CrdSubspacePageLayout />);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
