import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----
// This test exercises the real wiring between `useCurrentUserContext` and the
// activity-view toggle (corr-client-web-1 / qual-client-web-1): the persisted
// `settings.dashboard.activityView` value must actually be read on a fresh
// mount (simulating a reload) rather than always resolving to `undefined`.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { returnObjects?: boolean }) => (opts?.returnObjects ? [] : key),
  }),
}));

vi.mock('@/core/routing/useNavigate', () => ({
  default: () => vi.fn(),
}));

let mockUserModel: { id: string; settings?: { dashboard?: { activityView?: boolean } } } | undefined;
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    userModel: mockUserModel,
    platformRoles: [],
    accountEntitlements: [],
    accountId: undefined,
  }),
}));

vi.mock('@/domain/community/userCurrent/useHomeSpaceSettings', () => ({
  useHomeSpaceSettings: () => ({ homeSpaceId: undefined, membershipSettingsUrl: '/settings/membership' }),
}));

const updateUserSettingsMock = vi.fn().mockResolvedValue({});
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchUserSettingsQuery: (v: unknown) => ({ query: 'UserSettings', variables: v }),
  useDashboardExploreSpacesQuery: () => ({ data: undefined }),
  useHomeSpaceLookupQuery: () => ({ data: undefined }),
  useLatestContributionsQuery: () => ({ data: undefined, loading: false, fetchMore: vi.fn() }),
  useLatestContributionsSpacesFlatQuery: () => ({ data: undefined }),
  useMyMembershipsQuery: () => ({ data: undefined, loading: false }),
  useNonActivityHostedSpacesQuery: () => ({ data: undefined, loading: false }),
  useRecentSpacesQuery: () => ({ data: undefined, loading: false }),
  useUpdateUserSettingsMutation: () => [updateUserSettingsMock],
}));

vi.mock('./useDashboardSidebar', () => ({
  useDashboardSidebar: () => ({ menuItems: [], resourceSections: [] }),
}));

vi.mock('@/crd/components/dashboard/ActivityDialog', () => ({
  ActivityDialog: () => null,
}));
vi.mock('@/crd/components/dashboard/ActivityFeed', () => ({
  ActivityFeed: () => <div data-testid="activity-feed" />,
}));
vi.mock('@/crd/components/dashboard/CampaignBanner', () => ({
  CampaignBanner: () => null,
}));
vi.mock('@/crd/components/dashboard/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/crd/components/dashboard/DashboardSidebar', () => ({
  DashboardSidebar: () => null,
}));
vi.mock('@/crd/components/dashboard/MyMemberships/MyMembershipsPanel', () => ({
  MyMembershipsPanel: () => null,
}));
vi.mock('@/crd/components/dashboard/RecentSpaces', () => ({
  RecentSpaces: () => null,
}));
vi.mock('@/crd/components/dashboard/TipsAndTricksDialog', () => ({
  TipsAndTricksDialog: () => null,
}));
vi.mock('./NonActivityHomeSections', () => ({
  NonActivityHomeSections: () => <div data-testid="non-activity-sections" />,
}));
vi.mock('@/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog', () => ({
  CrdCreateSpaceDialog: () => null,
}));
vi.mock('@/main/crdPages/topLevelPages/vcPages/creationWizard/CrdVCCreationWizardDialog', () => ({
  CrdVCCreationWizardDialog: () => null,
}));

// Re-import after mock setup.
import DashboardWithMemberships from './DashboardWithMemberships';

const dialogState = {
  openDialog: null,
  openTipsAndTricks: vi.fn(),
  openMyActivity: vi.fn(),
  openMySpaceActivity: vi.fn(),
  openMemberships: vi.fn(),
  closeDialog: vi.fn(),
};

describe('DashboardWithMemberships — activity view preference wiring (corr-client-web-1 / qual-client-web-1)', () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockUserModel = undefined;
    localStorage.clear();
  });

  test('a fresh mount with the persisted setting off (false) shows the non-activity view, not the Activity feed', () => {
    // Simulates the user having turned Activity view off in a previous session:
    // `useCurrentUserContext` now resolves `settings.dashboard.activityView: false`
    // on the very first render (no local override yet — activityOverride starts null).
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView: false } } };
    localStorage.setItem('dashboardViewSeeded', '1'); // skip the legacy-seed effect

    render(<DashboardWithMemberships dialogState={dialogState} onPendingMembershipsClick={vi.fn()} />);

    expect(screen.getByTestId('non-activity-sections')).toBeTruthy();
    expect(screen.queryByTestId('activity-feed')).toBeNull();
  });

  test('a fresh mount with the persisted setting on (true) shows the Activity feed', () => {
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView: true } } };
    localStorage.setItem('dashboardViewSeeded', '1');

    render(<DashboardWithMemberships dialogState={dialogState} onPendingMembershipsClick={vi.fn()} />);

    expect(screen.getAllByTestId('activity-feed').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('non-activity-sections')).toBeNull();
  });

  test('a fresh mount with no persisted setting (undefined) defaults to the Activity feed (FR-024)', () => {
    mockUserModel = { id: 'user-1', settings: { dashboard: {} } };
    localStorage.setItem('dashboardViewSeeded', '1');

    render(<DashboardWithMemberships dialogState={dialogState} onPendingMembershipsClick={vi.fn()} />);

    expect(screen.getAllByTestId('activity-feed').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('non-activity-sections')).toBeNull();
  });
});
