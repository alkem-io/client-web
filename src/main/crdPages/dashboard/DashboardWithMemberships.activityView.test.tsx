import { ApolloProvider } from '@apollo/client';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createCapturingClient, type NativeReplies } from './nativeTestClient';

// ---- Mocks ----
// This test exercises the real wiring between the current user, the native dashboard documents (a real v2 cache behind
// a capturing link) and the activity-view toggle: the persisted `dashboard.activity_view` value must be read on a fresh
// mount, the toggle must persist through setSettings, and the activity feeds must ask Query.activity for the right
// feed (corr-client-web-1 / qual-client-web-1).

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { returnObjects?: boolean }) => (opts?.returnObjects ? [] : key),
  }),
}));

vi.mock('@/core/routing/useNavigate', () => ({
  default: () => vi.fn(),
}));

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notifyMock,
}));

let mockUserModel: { id: string; settings?: { dashboard?: { activityView?: boolean } } } | undefined;
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    userModel: mockUserModel,
    platformRoles: [],
  }),
}));

let mockRawSettings: Record<string, unknown> = {};
vi.mock('@/core/foundation/NativeFoundationProvider', () => ({
  useNativeFoundation: () => ({ data: { viewer: { actor: { settings: mockRawSettings } } } }),
}));

vi.mock('@/domain/community/userCurrent/useHomeSpaceSettings', () => ({
  useHomeSpaceSettings: () => ({ homeSpaceId: undefined, membershipSettingsUrl: '/settings/membership' }),
}));

vi.mock('./useDashboardSidebar', () => ({
  useDashboardSidebar: () => ({ menuItems: [], resourceSections: [] }),
}));

vi.mock('@/crd/components/dashboard/ActivityDialog', () => ({
  ActivityDialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
}));
vi.mock('@/crd/components/dashboard/ActivityFeed', () => ({
  ActivityFeed: ({
    feedId,
    onLoadMore,
    items,
    unavailableText,
  }: {
    feedId: string;
    onLoadMore?: () => void;
    items: Array<{ id: string; titlePlain?: string; contextName?: string; titleHref?: string }>;
    unavailableText?: string;
  }) => (
    <div data-testid="activity-feed">
      {unavailableText && <span data-testid={`${feedId}-unavailable`}>{unavailableText}</span>}
      {items.map(item => (
        <span key={item.id} data-testid={`${feedId}-item`}>
          {`${item.titlePlain}|${item.contextName}|${item.titleHref}`}
        </span>
      ))}
      {onLoadMore && <button type="button" data-testid={`load-more-${feedId}`} onClick={onLoadMore} />}
    </div>
  ),
}));
vi.mock('@/crd/components/dashboard/CampaignBanner', () => ({
  CampaignBanner: () => null,
}));
vi.mock('@/crd/components/dashboard/DashboardLayout', () => ({
  DashboardLayout: ({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) => (
    <div>
      {sidebar}
      {children}
    </div>
  ),
}));
vi.mock('@/crd/components/dashboard/DashboardSidebar', () => ({
  DashboardSidebar: ({ onActivityToggle }: { onActivityToggle: (enabled: boolean) => void }) => (
    <button type="button" data-testid="activity-off" onClick={() => onActivityToggle(false)} />
  ),
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

const SPACE_END_CURSOR = 'space-cursor-1';
const about = (displayName: string) => ({ __typename: 'About', displayName });
const space = (id: string, depth = 0) => ({
  __typename: 'Space',
  id,
  url: `/${id}`,
  depth,
  isContentPublic: true,
  about: { ...about(id), tagline: null, avatar: null, card: null },
});

const postCreated = {
  __typename: 'Activity',
  id: 'activity-1',
  type: 'post-created',
  createdAt: '2026-11-20T10:00:00Z',
  actor: { __typename: 'User', id: 'author', about: { ...about('Author'), avatar: null } },
  space: { __typename: 'Space', id: 'space-1', url: '/space-1', about: about('Space one') },
  subject: {
    __typename: 'Post',
    id: 'post-1',
    entityType: 'post',
    url: '/space-1/posts/response',
    about: about('A response'),
    parentPost: { __typename: 'Post', id: 'callout-1', url: '/space-1/posts/callout', about: about('The callout') },
  },
};

const replies = (): NativeReplies => ({
  V2DashboardRecentSpaces: () => ({
    viewer: {
      __typename: 'Viewer',
      id: 'user-1',
      recentSpaces: [
        { __typename: 'RecentSpace', lastParticipatedAt: '2026-11-20T10:00:00Z', space: space('space-1') },
      ],
      homeSpace: null,
    },
  }),
  V2DashboardHostedResources: () => ({
    viewer: {
      __typename: 'Viewer',
      id: 'user-1',
      account: {
        __typename: 'AccountSummary',
        id: 'account-1',
        canCreate: [],
        hosted: { __typename: 'HostedResources', spaces: [], agents: [], packs: [], homepages: [] },
      },
    },
  }),
  V2DashboardFeedSpaces: () => ({
    spaces: {
      __typename: 'SpaceConnection',
      edges: [{ __typename: 'SpaceEdge', node: { __typename: 'Space', id: 'space-1', about: about('Space one') } }],
    },
  }),
  V2DashboardActivity: variables => ({
    activity: {
      __typename: 'ActivityConnection',
      edges: variables.mine || variables.after ? [] : [{ __typename: 'ActivityEdge', cursor: 'c0', node: postCreated }],
      pageInfo: { __typename: 'PageInfo', hasNextPage: !variables.after, endCursor: SPACE_END_CURSOR },
    },
  }),
  V2DashboardMemberships: () => ({
    viewer: { __typename: 'Viewer', id: 'user-1', actor: { __typename: 'User', id: 'user-1', memberships: [] } },
  }),
  V2DashboardMostActiveSpaces: () => ({ spaces: { __typename: 'SpaceConnection', edges: [] } }),
  V2DashboardSaveUserSettings: variables => ({
    setSettings: { __typename: 'User', id: 'user-1', settings: variables.value },
  }),
});

const renderDashboard = (openDialog: 'my-space-activity' | null = null, overrides: NativeReplies = {}) => {
  const native = createCapturingClient({ ...replies(), ...overrides });
  render(
    <ApolloProvider client={native.client}>
      <DashboardWithMemberships dialogState={{ ...dialogState, openDialog }} onPendingMembershipsClick={vi.fn()} />
    </ApolloProvider>
  );
  return native;
};

afterEach(() => {
  vi.clearAllMocks();
  mockUserModel = undefined;
  mockRawSettings = {};
  localStorage.clear();
});

describe('DashboardWithMemberships — activity view preference wiring (corr-client-web-1 / qual-client-web-1)', () => {
  test('a fresh mount with the persisted setting off (false) shows the non-activity view, not the Activity feed', () => {
    // Simulates the user having turned Activity view off in a previous session: the native user model resolves
    // `settings.dashboard.activityView: false` on the very first render (no local override yet).
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView: false } } };
    localStorage.setItem('dashboardViewSeeded', '1'); // skip the legacy-seed effect

    renderDashboard();

    expect(screen.getByTestId('non-activity-sections')).toBeTruthy();
    expect(screen.queryByTestId('activity-feed')).toBeNull();
  });

  test('a fresh mount with the persisted setting on (true) shows the Activity feed', () => {
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView: true } } };
    localStorage.setItem('dashboardViewSeeded', '1');

    renderDashboard();

    expect(screen.getAllByTestId('activity-feed').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('non-activity-sections')).toBeNull();
  });

  test('a fresh mount with no persisted setting (undefined) defaults to the Activity feed (FR-024)', () => {
    mockUserModel = { id: 'user-1', settings: { dashboard: {} } };
    localStorage.setItem('dashboardViewSeeded', '1');

    renderDashboard();

    expect(screen.getAllByTestId('activity-feed').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('non-activity-sections')).toBeNull();
  });

  test('the toggle persists core.user_settings through setSettings, keeping every other settings key', async () => {
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView: true } } };
    mockRawSettings = { home_space: { id: 'home', auto_redirect: true }, dashboard: { activity_view: true } };
    localStorage.setItem('dashboardViewSeeded', '1');
    const { requests } = renderDashboard();

    await act(async () => {
      fireEvent.click(screen.getByTestId('activity-off'));
    });

    await waitFor(() => expect(requests.some(r => r.operationName === 'V2DashboardSaveUserSettings')).toBe(true));
    const save = requests.find(r => r.operationName === 'V2DashboardSaveUserSettings');
    expect(save?.query).toContain('setSettings(id: $id, namespace: "core", name: "user_settings", value: $value)');
    expect(save?.variables).toEqual({
      id: 'user-1',
      value: { home_space: { id: 'home', auto_redirect: true }, dashboard: { activity_view: false } },
    });
    expect(screen.getByTestId('non-activity-sections')).toBeTruthy();
    expect(requests.some(r => r.operationName === 'V2DashboardMostActiveSpaces')).toBe(true);
    expect(requests.find(r => r.operationName === 'V2DashboardMostActiveSpaces')?.variables).toEqual({
      days: 7,
      first: 4,
    });
  });
});

// The feed arguments are shared by the initial query and the `fetchMore` call, which are two separate call sites. An
// implementation that set `mine: false` at the first one only would pass every other check while each *Load more*
// page silently re-included the user's own activity (AC3).
describe('DashboardWithMemberships — Query.activity feeds (screens-dispositions.tsv:5206-5207)', () => {
  const activityRequests = (requests: ReturnType<typeof renderDashboard>['requests']) =>
    requests.filter(r => r.operationName === 'V2DashboardActivity');

  test("the initial spaces feed asks for others' activity across the member spaces, without whiteboard edits", async () => {
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView: true } } };
    localStorage.setItem('dashboardViewSeeded', '1');
    const { requests } = renderDashboard();

    await waitFor(() => expect(activityRequests(requests)).toHaveLength(2));
    const spaces = activityRequests(requests).find(r => r.variables.mine === false);
    expect(spaces?.variables).toEqual({
      first: 20,
      mine: false,
      excludeTypes: ['whiteboard-content-modified'],
    });
    expect(requests.find(r => r.operationName === 'V2DashboardRecentSpaces')?.variables).toEqual({ first: 5 });
    expect(requests.map(r => r.operationName)).not.toContain('V2DashboardMemberships');
  });

  test('a feed entry maps the subject and the parent post (response → its callout)', async () => {
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView: true } } };
    localStorage.setItem('dashboardViewSeeded', '1');
    renderDashboard();

    await waitFor(() =>
      expect(screen.getByTestId('inline-spaces-item').textContent).toBe(
        'A response|The callout|/space-1/posts/response'
      )
    );
  });

  test('the spaces-feed fetchMore carries the same arguments and the opaque cursor', async () => {
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView: true } } };
    localStorage.setItem('dashboardViewSeeded', '1');
    const { requests } = renderDashboard('my-space-activity');

    await waitFor(() => expect(activityRequests(requests)).toHaveLength(2));
    await act(async () => {
      fireEvent.click(screen.getByTestId('load-more-dialog-spaces'));
    });

    await waitFor(() => expect(activityRequests(requests)).toHaveLength(3));
    expect(activityRequests(requests)[2].variables).toEqual({
      first: 20,
      after: SPACE_END_CURSOR,
      mine: false,
      excludeTypes: ['whiteboard-content-modified'],
    });
  });

  test('the My activity feed asks for the viewer’s own activity only', async () => {
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView: true } } };
    localStorage.setItem('dashboardViewSeeded', '1');
    const { requests } = renderDashboard();

    await waitFor(() => expect(activityRequests(requests)).toHaveLength(2));
    expect(activityRequests(requests).find(r => r.variables.mine === true)?.variables).toEqual({
      first: 20,
      mine: true,
      excludeTypes: ['whiteboard-content-modified'],
    });
  });
});

describe('DashboardWithMemberships — Query.activity not served yet (NOT1)', () => {
  test('each feed shows its not-available state once, with no toast, retry or fetchMore, and the page settles', async () => {
    mockUserModel = { id: 'user-1', settings: { dashboard: { activityView: true } } };
    localStorage.setItem('dashboardViewSeeded', '1');
    const { requests } = renderDashboard('my-space-activity', {
      // the selection admission's refusal: UNAVAILABLE on no field path
      V2DashboardActivity: () => {
        throw new GraphQLError('unavailable', { extensions: { code: 'UNAVAILABLE' } });
      },
    });

    await waitFor(() => expect(screen.getByTestId('inline-spaces-unavailable')).toBeTruthy());
    expect(screen.getByTestId('inline-personal-unavailable').textContent).toBe(
      'apollo.errors.userMessages.operations.notAvailableYet'
    );
    expect(screen.getByTestId('dialog-spaces-unavailable')).toBeTruthy();
    expect(screen.queryByTestId('inline-spaces-item')).toBeNull();
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(requests.filter(r => r.operationName === 'V2DashboardActivity')).toHaveLength(2);
    expect(notifyMock).not.toHaveBeenCalled();
  });
});
