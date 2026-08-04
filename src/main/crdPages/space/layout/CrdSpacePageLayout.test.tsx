import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import CrdSpacePageLayout from './CrdSpacePageLayout';

// ---- Mocks ----
// CrdSpacePageLayout is a large orchestrator with many data/UI hooks. Everything
// unrelated to the join/apply wiring under test is stubbed to a minimal value so
// the component can render without a live Apollo/router tree, following the
// module-mock pattern used by CrdSubspaceProtectedRoutes.test.tsx.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let mockPathname = '/welcome-space';
vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet" />,
  useLocation: () => ({ pathname: mockPathname }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock('@/core/routing/usePageTitle', () => ({
  usePageTitle: () => {},
}));

vi.mock('@/crd/hooks/useMediaQuery', () => ({
  useScreenSize: () => ({ isSmallScreen: false }),
}));

const useSpaceMock = vi.fn();
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => useSpaceMock(),
}));

vi.mock('@/domain/space/hooks/useVideoCall', () => ({
  useVideoCall: () => ({ isVideoCallEnabled: false, videoCallUrl: undefined }),
}));

vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  StorageConfigContextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard', () => ({
  useDirtyTabGuard: () => ({
    isDirty: false,
    markDirty: () => {},
    clearDirty: () => {},
    requestSwitch: vi.fn().mockResolvedValue(true),
    pendingSwitch: null,
    resolvePendingSwitch: () => {},
  }),
}));

vi.mock('@/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab', () => ({
  useSpaceSettingsTab: () => ({ activeTab: 'about', setActiveTab: vi.fn() }),
}));

const useUrlResolverMock = vi.fn();
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => useUrlResolverMock(),
}));

vi.mock('@/main/ui/breadcrumbs/BreadcrumbsContext', () => ({
  useSetBreadcrumbs: () => {},
}));

vi.mock('@/main/ui/layout/BannerOverlayContext', () => ({
  useEnableBannerOverlay: () => {},
}));

vi.mock('@/main/ui/layout/LayoutWidthContext', () => ({
  useEnableSpaceFullWidth: () => {},
}));

vi.mock('@/main/ui/layout/useDownNoticeBanner', () => ({
  useDownNoticeBanner: () => ({ visible: false }),
}));

vi.mock('@/main/ui/layout/useLayoutWidthPreference', () => ({
  useLayoutWidthPreference: () => ({ wide: false, toggle: () => {} }),
}));

vi.mock('@/crd/components/common/ShareDialog', () => ({
  ShareDialog: () => null,
}));

vi.mock('../dialogs/CrdSpaceActivityDialogConnector', () => ({
  CrdSpaceActivityDialogConnector: () => null,
}));

vi.mock('../hooks/useCrdSpaceTabs', () => ({
  useCrdSpaceTabs: () => ({ tabs: [], defaultTabIndex: 0, sectionCount: 1, showSettings: false }),
}));

const spaceApplyButtonConnectorSpy = vi.fn();
vi.mock('../SpaceApplyButtonConnector', () => ({
  SpaceApplyButtonConnector: (props: unknown) => {
    spaceApplyButtonConnectorSpy(props);
    return <div data-testid="space-apply-button" />;
  },
}));

const buildSpace = () => ({
  space: {
    id: 'welcome-space-id',
    nameID: 'welcome-space',
    about: {
      profile: {
        displayName: 'Welcome Space',
        tagline: 'A public welcome space',
        url: '/welcome-space',
        banner: undefined,
      },
    },
  },
  visibility: undefined,
  permissions: { canRead: true },
  loading: false,
});

describe('CrdSpacePageLayout — join/apply entry point', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/welcome-space';
    useUrlResolverMock.mockReturnValue({
      spaceId: 'welcome-space-id',
      spaceLevel: SpaceLevel.L0,
      loading: false,
    });
    useSpaceMock.mockReturnValue(buildSpace());
  });

  test('renders the apply/join button for a public, application-required L0 space', () => {
    render(<CrdSpacePageLayout />);

    expect(screen.getByTestId('space-apply-button')).toBeInTheDocument();
    expect(spaceApplyButtonConnectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        spaceId: 'welcome-space-id',
        spaceProfileUrl: '/welcome-space',
        communityName: 'Welcome Space',
      })
    );
  });

  test('does not render the apply/join button on the space settings pages', () => {
    mockPathname = '/welcome-space/settings';

    render(<CrdSpacePageLayout />);

    expect(screen.queryByTestId('space-apply-button')).not.toBeInTheDocument();
  });
});
