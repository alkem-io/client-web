import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  ActivityEventType,
  type ActivityFeedQueryArgs,
  type LatestContributionsQueryVariables,
} from '@/core/apollo/generated/graphql-schema';

// ---- Mocks ----
// This test exercises the real wiring between `useCurrentUserContext` and the
// activity-view toggle (corr-client-web-1 / qual-client-web-1): the persisted
// `settings.dashboard.activityView` value must actually be read on a fresh
// mount (simulating a reload) rather than always resolving to `undefined`.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { returnObjects?: boolean }) => (opts?.returnObjects ? [] : key),
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
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

// `useLatestContributionsQuery` is called once per activity block with that block's
// filter. Recording it is what makes the `excludeMyActivity` wiring falsifiable; the
// space block also needs a cursor so its *Load more* path can actually run.
const SPACE_END_CURSOR = 'space-cursor-1';
const fetchMoreSpaceActivityMock = vi.fn().mockResolvedValue({});
const useLatestContributionsQueryMock = vi.fn((options: { variables: LatestContributionsQueryVariables }) =>
  options.variables.filter?.myActivity
    ? { data: undefined, loading: false, fetchMore: vi.fn() }
    : {
        data: { activityFeed: { activityFeed: [], pageInfo: { hasNextPage: true, endCursor: SPACE_END_CURSOR } } },
        loading: false,
        fetchMore: fetchMoreSpaceActivityMock,
      }
);
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchUserSettingsQuery: (v: unknown) => ({ query: 'UserSettings', variables: v }),
  useDashboardExploreSpacesQuery: () => ({ data: undefined }),
  useHomeSpaceLookupQuery: () => ({ data: undefined }),
  useLatestContributionsQuery: (options: { variables: LatestContributionsQueryVariables }) =>
    useLatestContributionsQueryMock(options),
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
  ActivityDialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
}));
vi.mock('@/crd/components/dashboard/ActivityFeed', () => ({
  ActivityFeed: ({ feedId, onLoadMore }: { feedId: string; onLoadMore?: () => void }) => (
    <div data-testid="activity-feed">
      {onLoadMore && <button type="button" data-testid={`load-more-${feedId}`} onClick={onLoadMore} />}
    </div>
  ),
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
  RecentSpaces: () => <div data-testid="recent-spaces" />,
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

let mockUnreadMessages = 0;
let mockUnreadNotifications = 0;
const setMessagingOpenMock = vi.fn();
const setNotificationsOpenMock = vi.fn();
const trackChatOpenMock = vi.fn();
vi.mock('@/main/userMessaging/useUnreadConversationsCount', () => ({
  useUnreadConversationsCount: () => mockUnreadMessages,
}));
vi.mock('@/main/inAppNotifications/useUnreadNotificationsCount', () => ({
  useUnreadNotificationsCount: () => mockUnreadNotifications,
}));
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({ setIsOpen: setMessagingOpenMock }),
}));
vi.mock('@/main/inAppNotifications/InAppNotificationsContext', () => ({
  useInAppNotificationsContext: () => ({ setIsOpen: setNotificationsOpenMock }),
}));
vi.mock('@/core/analytics/events/unifiedChat', () => ({
  trackChatOpen: (source: string) => trackChatOpenMock(source),
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

  test('seeding the setting from the legacy device choice runs unasked, so it opts out of the global error handler', () => {
    mockUserModel = { id: 'user-1', settings: { dashboard: {} } };
    localStorage.setItem('dashboardView', 'SPACES');

    render(<DashboardWithMemberships dialogState={dialogState} onPendingMembershipsClick={vi.fn()} />);

    expect(updateUserSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({ context: { skipGlobalErrorHandler: true } })
    );
  });
});

// The filter object is shared by the initial query and the `fetchMore` call, which are
// two separate call sites. An implementation that set the flag at the first one only
// would pass every other check while each *Load more* page silently re-included the
// user's own activity (AC3).
describe('DashboardWithMemberships — own activity excluded from the spaces feed (AC1/AC2/AC3)', () => {
  // Typed against the generated input, so a stale codegen fails this file at typecheck
  // rather than at runtime (AC7).
  const expectedSpaceFilter: ActivityFeedQueryArgs = {
    spaceIds: [],
    roles: undefined,
    excludeTypes: [ActivityEventType.CalloutWhiteboardContentModified],
    excludeMyActivity: true,
  };

  const renderDashboard = (openDialog: 'my-space-activity' | null) => {
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView: true } } };
    localStorage.setItem('dashboardViewSeeded', '1');
    render(
      <DashboardWithMemberships dialogState={{ ...dialogState, openDialog }} onPendingMembershipsClick={vi.fn()} />
    );
  };

  afterEach(() => {
    vi.clearAllMocks();
    mockUserModel = undefined;
    localStorage.clear();
  });

  test("the initial spaces-feed query excludes the user's own activity", () => {
    renderDashboard(null);

    const spaceFilters = useLatestContributionsQueryMock.mock.calls
      .map(([options]) => options.variables.filter)
      .filter(filter => !filter?.myActivity);

    expect(spaceFilters.length).toBeGreaterThan(0);
    expect(spaceFilters[0]).toEqual(expectedSpaceFilter);
  });

  test('the spaces-feed fetchMore carries the same exclusion', async () => {
    renderDashboard('my-space-activity');

    await act(async () => {
      fireEvent.click(screen.getByTestId('load-more-dialog-spaces'));
    });

    expect(fetchMoreSpaceActivityMock).toHaveBeenCalledTimes(1);
    expect(fetchMoreSpaceActivityMock.mock.calls[0][0]).toEqual({
      variables: { first: expect.any(Number), after: SPACE_END_CURSOR, filter: expectedSpaceFilter },
    });
  });

  test('the My activity query is unchanged — myActivity only, no exclusion flag', () => {
    renderDashboard(null);

    const personalFilters = useLatestContributionsQueryMock.mock.calls
      .map(([options]) => options.variables.filter)
      .filter(filter => filter?.myActivity);

    expect(personalFilters.length).toBeGreaterThan(0);
    expect(personalFilters[0]).toEqual({
      spaceIds: [],
      myActivity: true,
      excludeTypes: [ActivityEventType.CalloutWhiteboardContentModified],
    });
  });
});

// 108: the phone-only unread rows come first on Home, whichever view is on, and open the
// chat list / notifications panel the header badges open.
describe('DashboardWithMemberships — phone unread rows (108)', () => {
  const renderDashboard = (activityView: boolean) => {
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView } } };
    localStorage.setItem('dashboardViewSeeded', '1');
    render(<DashboardWithMemberships dialogState={dialogState} onPendingMembershipsClick={vi.fn()} />);
  };

  const precedes = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

  afterEach(() => {
    vi.clearAllMocks();
    mockUserModel = undefined;
    mockUnreadMessages = 0;
    mockUnreadNotifications = 0;
    localStorage.clear();
  });

  test.each([
    ['on', true, 'recent-spaces'],
    ['off', false, 'non-activity-sections'],
  ])('with Activity View %s, Messages then Notifications precede the existing content', (_, activityView, firstExisting) => {
    mockUnreadMessages = 2;
    mockUnreadNotifications = 3;
    renderDashboard(activityView);

    const messages = screen.getByRole('button', { name: 'unreadSummary.messages.ariaLabel' });
    const notifications = screen.getByRole('button', { name: 'unreadSummary.notifications.ariaLabel' });
    expect(precedes(messages, notifications)).toBe(true);
    expect(precedes(notifications, screen.getByTestId(firstExisting))).toBe(true);
  });

  test('no row is rendered when both counts are 0', () => {
    renderDashboard(true);

    expect(screen.queryByRole('button', { name: /unreadSummary/ })).toBeNull();
    expect(screen.queryByRole('heading', { name: /unreadSummary/ })).toBeNull();
  });

  test('the Messages row opens the chat list and tracks the open; the Notifications row opens the panel', () => {
    mockUnreadMessages = 1;
    mockUnreadNotifications = 1;
    renderDashboard(true);

    fireEvent.click(screen.getByRole('button', { name: 'unreadSummary.messages.ariaLabel' }));
    expect(trackChatOpenMock).toHaveBeenCalledWith('homeUnreadRow');
    expect(setMessagingOpenMock).toHaveBeenCalledWith(true);
    expect(setNotificationsOpenMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'unreadSummary.notifications.ariaLabel' }));
    expect(setNotificationsOpenMock).toHaveBeenCalledWith(true);
  });
});
