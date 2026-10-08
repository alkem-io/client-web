import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// workspace#027 Slice A: the dashboard Virtual Contributor campaign banner was
// gated on the legacy `PLATFORM_VC_CAMPAIGN` role only. Its additive successor
// `FEATURE_VC_CAMPAIGN` must light the banner too, while the legacy role keeps
// working until Slice B retires it.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { returnObjects?: boolean }) => (opts?.returnObjects ? [] : key),
  }),
}));

vi.mock('@/core/routing/useNavigate', () => ({
  default: () => vi.fn(),
}));

let mockPlatformRoles: string[] = [];
let mockAccountEntitlements: string[] = [];
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    userModel: { id: 'user-1', settings: { dashboard: { activityView: true } } },
    platformRoles: mockPlatformRoles,
    accountEntitlements: mockAccountEntitlements,
    accountId: undefined,
  }),
}));

vi.mock('@/domain/community/userCurrent/useHomeSpaceSettings', () => ({
  useHomeSpaceSettings: () => ({ homeSpaceId: undefined, membershipSettingsUrl: '/settings/membership' }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchUserSettingsQuery: (v: unknown) => ({ query: 'UserSettings', variables: v }),
  useDashboardExploreSpacesQuery: () => ({ data: undefined }),
  useHomeSpaceLookupQuery: () => ({ data: undefined }),
  useLatestContributionsQuery: () => ({ data: undefined, loading: false, fetchMore: vi.fn() }),
  useLatestContributionsSpacesFlatQuery: () => ({ data: undefined }),
  useMyMembershipsQuery: () => ({ data: undefined, loading: false }),
  useNonActivityHostedSpacesQuery: () => ({ data: undefined, loading: false }),
  useRecentSpacesQuery: () => ({ data: undefined, loading: false }),
  useUpdateUserSettingsMutation: () => [vi.fn().mockResolvedValue({})],
}));

vi.mock('./useDashboardSidebar', () => ({
  useDashboardSidebar: () => ({ menuItems: [], resourceSections: [] }),
}));

vi.mock('@/crd/components/dashboard/ActivityDialog', () => ({ ActivityDialog: () => null }));
vi.mock('@/crd/components/dashboard/ActivityFeed', () => ({ ActivityFeed: () => null }));
vi.mock('@/crd/components/dashboard/CampaignBanner', () => ({
  CampaignBanner: () => <div data-testid="campaign-banner" />,
}));
vi.mock('@/crd/components/dashboard/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/crd/components/dashboard/DashboardSidebar', () => ({ DashboardSidebar: () => null }));
vi.mock('@/crd/components/dashboard/MyMemberships/MyMembershipsPanel', () => ({ MyMembershipsPanel: () => null }));
vi.mock('@/crd/components/dashboard/RecentSpaces', () => ({ RecentSpaces: () => null }));
vi.mock('@/crd/components/dashboard/TipsAndTricksDialog', () => ({ TipsAndTricksDialog: () => null }));
vi.mock('./NonActivityHomeSections', () => ({ NonActivityHomeSections: () => null }));
vi.mock('@/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog', () => ({
  CrdCreateSpaceDialog: () => null,
}));
vi.mock('@/main/crdPages/topLevelPages/vcPages/creationWizard/CrdVCCreationWizardDialog', () => ({
  CrdVCCreationWizardDialog: () => null,
}));

import DashboardWithMemberships from './DashboardWithMemberships';

const dialogState = {
  openDialog: null,
  openTipsAndTricks: vi.fn(),
  openMyActivity: vi.fn(),
  openMySpaceActivity: vi.fn(),
  openMemberships: vi.fn(),
  closeDialog: vi.fn(),
};

const renderDashboard = () => {
  localStorage.setItem('dashboardViewSeeded', '1');
  return render(<DashboardWithMemberships dialogState={dialogState} onPendingMembershipsClick={vi.fn()} />);
};

describe('DashboardWithMemberships — VC campaign banner gating (workspace#027 FEATURE_VC_CAMPAIGN)', () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockPlatformRoles = [];
    mockAccountEntitlements = [];
    localStorage.clear();
  });

  test('a holder of only FEATURE_VC_CAMPAIGN with the VC entitlement sees the banner', () => {
    mockPlatformRoles = ['FEATURE_VC_CAMPAIGN'];
    mockAccountEntitlements = ['ACCOUNT_VIRTUAL_CONTRIBUTOR'];

    renderDashboard();

    expect(screen.getByTestId('campaign-banner')).toBeTruthy();
  });

  test('the retired PLATFORM_VC_CAMPAIGN role no longer targets the banner (Slice B, T013)', () => {
    mockPlatformRoles = ['PLATFORM_VC_CAMPAIGN'];
    mockAccountEntitlements = ['ACCOUNT_VIRTUAL_CONTRIBUTOR'];

    renderDashboard();

    expect(screen.queryByTestId('campaign-banner')).toBeNull();
  });

  test('a viewer holding neither campaign role does not see the banner, entitlement or not', () => {
    mockPlatformRoles = ['FEATURE_BETA_TESTER'];
    mockAccountEntitlements = ['ACCOUNT_VIRTUAL_CONTRIBUTOR'];

    renderDashboard();

    expect(screen.queryByTestId('campaign-banner')).toBeNull();
  });

  test('the role alone is not enough — the VC entitlement is still required', () => {
    mockPlatformRoles = ['FEATURE_VC_CAMPAIGN'];
    mockAccountEntitlements = [];

    renderDashboard();

    expect(screen.queryByTestId('campaign-banner')).toBeNull();
  });
});
