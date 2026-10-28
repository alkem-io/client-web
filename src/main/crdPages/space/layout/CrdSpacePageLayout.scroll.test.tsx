import { act, fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';
import {
  MemoryRouter,
  type NavigateFunction,
  type NavigateOptions,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import CrdSpacePageLayout from './CrdSpacePageLayout';

// ---- controllable state -----------------------------------------------------

let tabsLoaded = true;
let defaultTabIndex = 0;

const tabsResult = () => ({
  tabs: [
    { index: 0, label: 'Dashboard', description: '', icon: null, isCustom: false },
    { index: 1, label: 'Community', description: '', icon: null, isCustom: false },
    { index: 2, label: 'Subspaces', description: '', icon: null, isCustom: false },
  ],
  defaultTabIndex,
  sectionCount: 3,
  showSettings: false,
  stateSidebars: [],
  loaded: tabsLoaded,
});

// ---- module mocks -----------------------------------------------------------

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
vi.mock('@/core/routing/usePageTitle', () => ({ usePageTitle: () => {} }));
vi.mock('@/crd/components/common/LoadingSpinner', () => ({ LoadingSpinner: () => null }));
vi.mock('@/crd/components/common/MobileSidebarDrawer', () => ({ MobileSidebarDrawer: () => null }));
vi.mock('@/crd/components/common/ShareDialog', () => ({ ShareDialog: () => null }));
vi.mock('@/crd/components/space/HeaderActionIcons', () => ({ HeaderActionIcons: () => null }));
vi.mock('@/crd/components/space/SpaceHeader', () => ({ SpaceHeader: () => null }));
vi.mock('@/crd/components/space/SpaceVisibilityNotice', () => ({ SpaceVisibilityNotice: () => null }));
vi.mock('@/crd/components/space/settings/SpaceSettingsHeader', () => ({ SpaceSettingsHeader: () => null }));
vi.mock('@/crd/components/space/settings/SpaceSettingsTabStrip', () => ({ SpaceSettingsTabStrip: () => null }));
vi.mock('@/crd/hooks/useEdgeSwipe', () => ({ useEdgeSwipe: () => {} }));
vi.mock('@/crd/hooks/useMediaQuery', () => ({
  useMediaQuery: () => false,
  useScreenSize: () => ({ isSmallScreen: false }),
}));
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    space: {
      id: 'space-1',
      nameID: 'space',
      about: { profile: { url: '/space', displayName: 'Space', tagline: null } },
    },
    visibility: undefined,
    permissions: { canRead: true },
    loading: false,
  }),
}));
vi.mock('@/domain/space/hooks/useVideoCall', () => ({
  useVideoCall: () => ({ isVideoCallEnabled: false, videoCallUrl: undefined }),
}));
vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  StorageConfigContextProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard', () => ({
  useDirtyTabGuard: () => ({ requestSwitch: async () => true }),
}));
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ spaceId: 'space-1', spaceLevel: 'L0', loading: false }),
}));
vi.mock('@/main/ui/breadcrumbs/BreadcrumbsContext', () => ({ useSetBreadcrumbs: () => {} }));
vi.mock('@/main/ui/layout/BannerOverlayContext', () => ({ useEnableBannerOverlay: () => {} }));
vi.mock('@/main/ui/layout/LayoutWidthContext', () => ({ useEnableSpaceFullWidth: () => {} }));
vi.mock('@/main/ui/layout/useDownNoticeBanner', () => ({ useDownNoticeBanner: () => ({ visible: false }) }));
vi.mock('@/main/ui/layout/useLayoutWidthPreference', () => ({
  useLayoutWidthPreference: () => ({ wide: false, toggle: vi.fn() }),
}));
vi.mock('../callout/CalloutShareOnAlkemioForm', () => ({ CalloutShareOnAlkemioForm: () => null }));
vi.mock('../dataMappers/spacePageDataMapper', () => ({ mapSpaceVisibility: () => ({ status: 'active' }) }));
vi.mock('../dialogs/CrdSpaceAboutDialogConnector', () => ({ CrdSpaceAboutDialogConnector: () => null }));
vi.mock('../dialogs/CrdSpaceActivityDialogConnector', () => ({ CrdSpaceActivityDialogConnector: () => null }));
vi.mock('../hooks/useCrdSpaceTabs', () => ({ useCrdSpaceTabs: () => tabsResult() }));

// ---- harness ------------------------------------------------------------------

const probe: { navigate?: NavigateFunction } = {};
function NavigateProbe() {
  const nav = useNavigate();
  useEffect(() => {
    probe.navigate = nav;
  });
  return null;
}
const navigate = (to: string, options?: NavigateOptions) => probe.navigate?.(to, options);

const renderLayout = (initialEntry = '/space') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <NavigateProbe />
      <Routes>
        <Route path="/space" element={<CrdSpacePageLayout />} />
      </Routes>
    </MemoryRouter>
  );

// ---- tests --------------------------------------------------------------------

describe('CrdSpacePageLayout scroll on tab change', () => {
  let scrollTo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tabsLoaded = true;
    defaultTabIndex = 0;
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    // jsdom has no scrollIntoView; the tab strip uses it to reveal the active tab.
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    scrollTo.mockRestore();
  });

  test('does not scroll on the initial mount', () => {
    renderLayout('/space?tab=2');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  test('clicking another tab scrolls to the top', () => {
    renderLayout();
    fireEvent.click(screen.getByRole('tab', { name: 'Community' }));
    expect(screen.getByRole('tab', { name: 'Community' })).toHaveAttribute('aria-selected', 'true');
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('a link to another ?tab on the same space scrolls to the top', () => {
    renderLayout('/space?tab=1');
    act(() => navigate('/space?tab=3'));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('a dialog param change on the same tab does not scroll', () => {
    renderLayout('/space?tab=2');
    act(() => navigate('/space?tab=2&dialog=updates'));
    act(() => navigate('/space?tab=2'));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  test('a keepScroll navigation does not scroll', () => {
    renderLayout('/space?tab=2');
    act(() => navigate('/space?tab=3', { state: { keepScroll: true } }));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  test('the default tab resolving when the tabs load does not scroll', () => {
    tabsLoaded = false;
    const { rerender } = renderLayout();
    tabsLoaded = true;
    defaultTabIndex = 2;
    rerender(
      <MemoryRouter initialEntries={['/space']}>
        <NavigateProbe />
        <Routes>
          <Route path="/space" element={<CrdSpacePageLayout />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole('tab', { name: 'Subspaces' })).toHaveAttribute('aria-selected', 'true');
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
