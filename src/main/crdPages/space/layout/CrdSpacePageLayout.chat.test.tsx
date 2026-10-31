import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import CrdSpacePageLayout from './CrdSpacePageLayout';

// ---- controllable state -----------------------------------------------------

let chatOpen = false;
const tabsLoaded = true;
const defaultTabIndex = 0;

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
vi.mock('@/crd/components/common/MobileSidebarDrawer', () => ({
  MobileSidebarDrawer: ({ open }: { open: boolean }) => <div data-testid="drawer" data-open={String(open)} />,
}));
vi.mock('@/crd/components/space/SpaceNavigationTabs', () => ({
  SpaceNavigationTabs: ({ onMenuClick }: { onMenuClick: () => void }) => (
    <button type="button" onClick={onMenuClick}>
      menu
    </button>
  ),
}));
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({ isOpen: chatOpen }),
}));
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

const layout = () => (
  <MemoryRouter initialEntries={['/space']}>
    <Routes>
      <Route path="/space" element={<CrdSpacePageLayout />} />
    </Routes>
  </MemoryRouter>
);

const drawerOpen = () => screen.getByTestId('drawer').getAttribute('data-open');

// ---- tests --------------------------------------------------------------------

describe('CrdSpacePageLayout mobile menu and the chat', () => {
  beforeEach(() => {
    chatOpen = false;
    Element.prototype.scrollIntoView = vi.fn();
  });

  test('opening the chat from inside the open mobile menu closes the menu', () => {
    const { rerender } = render(layout());
    fireEvent.click(screen.getByRole('button', { name: 'menu' }));
    expect(drawerOpen()).toBe('true');

    chatOpen = true;
    rerender(layout());
    expect(drawerOpen()).toBe('false');
  });

  test('the menu opens normally while the chat is closed', () => {
    render(layout());
    fireEvent.click(screen.getByRole('button', { name: 'menu' }));
    expect(drawerOpen()).toBe('true');
  });
});
