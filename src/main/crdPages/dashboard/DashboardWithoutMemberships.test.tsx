import { ApolloProvider } from '@apollo/client';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { pendingOrganizationRequest, pendingSpaceRequest } from './dashboardPendingTestData';
import { createCapturingClient, type NativeReplies } from './nativeTestClient';

// The no-memberships dashboard on the native API: pending requests (Viewer.pendingInvitations / pendingApplications),
// the welcome space resolved by its handle, the most-active ranking and the sidebar's account resources, all through a
// real v2 cache behind a capturing link.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { returnObjects?: boolean }) => (opts?.returnObjects ? [] : key),
    i18n: { exists: () => false },
  }),
}));

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({
  default: () => navigateMock,
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => vi.fn(),
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    userModel: { id: 'user-1', profile: { displayName: 'Me', url: '/user/me' } },
    isAuthenticated: true,
    loading: false,
    accountId: 'account-1',
    accountCanCreate: [{ kind: 'space', allowed: true }],
    platformRoles: [],
  }),
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
  DashboardSidebar: ({
    menuItems,
    resourceSections,
  }: {
    menuItems: Array<{ id: string; badgeCount?: number; href?: string }>;
    resourceSections: Array<{ title: string; items: Array<{ id: string; href: string; avatarUrl?: string }> }>;
  }) => (
    <div>
      <span data-testid="invitations-badge">{menuItems.find(item => item.id === 'invitations')?.badgeCount}</span>
      <span data-testid="create-space-link">{menuItems.find(item => item.id === 'create-space')?.href}</span>
      {resourceSections.map(section =>
        section.items.map(item => (
          <span
            key={item.id}
            data-testid="resource"
          >{`${section.title}:${item.id}:${item.href}:${item.avatarUrl}`}</span>
        ))
      )}
    </div>
  ),
}));
vi.mock('@/crd/components/dashboard/InvitationsBlock', () => ({
  InvitationsBlock: ({
    invitations,
    onAccept,
  }: {
    invitations: Array<{ id: string; spaceName: string; inviterName?: string }>;
    onAccept: (id: string) => void;
  }) => (
    <div>
      {invitations.map(invitation => (
        <button key={invitation.id} type="button" data-testid="invitation" onClick={() => onAccept(invitation.id)}>
          {`${invitation.id}:${invitation.inviterName}`}
        </button>
      ))}
    </div>
  ),
}));
vi.mock('@/crd/components/dashboard/ApplicationsBlock', () => ({
  ApplicationsBlock: ({ applications }: { applications: Array<{ id: string }> }) => (
    <div>
      {applications.map(application => (
        <span key={application.id} data-testid="application">
          {application.id}
        </span>
      ))}
    </div>
  ),
}));
vi.mock('@/crd/components/dashboard/CompactSpaceCard', () => ({
  CompactSpaceCard: ({ id }: { id: string }) => <span data-testid="explore-card">{id}</span>,
  CompactSpaceCardSkeleton: () => null,
}));
vi.mock('@/crd/components/dashboard/WelcomeBlock', () => ({
  WelcomeBlock: () => <div data-testid="welcome-block" />,
}));
vi.mock('@/crd/components/dashboard/CampaignBanner', () => ({ CampaignBanner: () => null }));
vi.mock('@/crd/components/dashboard/TipsAndTricksDialog', () => ({ TipsAndTricksDialog: () => null }));
vi.mock('@/main/crdPages/topLevelPages/vcPages/creationWizard/CrdVCCreationWizardDialog', () => ({
  CrdVCCreationWizardDialog: () => null,
}));

import DashboardWithoutMemberships from './DashboardWithoutMemberships';

const dialogState = {
  openDialog: null,
  openTipsAndTricks: vi.fn(),
  openMyActivity: vi.fn(),
  openMySpaceActivity: vi.fn(),
  openMemberships: vi.fn(),
  closeDialog: vi.fn(),
};

const card = (id: string, depth = 0) => ({
  __typename: 'Space',
  id,
  url: `/${id}`,
  depth,
  isContentPublic: true,
  about: { __typename: 'About', displayName: id, tagline: null, avatar: null, card: null },
});
const named = (id: string) => ({
  id,
  url: `/${id}`,
  about: {
    __typename: 'About',
    displayName: id,
    avatar: { __typename: 'FileRef', file: { __typename: 'File', id: `f-${id}`, url: `/avatar/${id}` } },
  },
});

const typed = <T extends object>(request: T) => ({ __typename: 'MembershipRequest', ...request });

const replies = (welcome: 'found' | 'missing', pending = true): NativeReplies => ({
  V2PendingMemberships: () => ({
    viewer: {
      __typename: 'Viewer',
      id: 'user-1',
      pendingInvitations: pending
        ? [
            typed(pendingSpaceRequest('own-invitation')),
            typed(
              pendingSpaceRequest(
                'org-addressed',
                {},
                {
                  actor: {
                    __typename: 'Organization',
                    id: 'org',
                    actorType: 'organization',
                    about: { displayName: 'O' },
                  },
                }
              )
            ),
            typed(pendingOrganizationRequest('org-associate')),
          ]
        : [],
      pendingApplications: pending ? [typed(pendingSpaceRequest('own-application'))] : [],
    },
  }),
  V2DashboardMostActiveSpaces: () => ({
    spaces: {
      __typename: 'SpaceConnection',
      edges: [card('busy'), card('welcome-space'), card('quiet', 1)].map(node => ({ __typename: 'SpaceEdge', node })),
    },
  }),
  V2DashboardWelcomeSpace: () => ({
    resolve:
      welcome === 'found'
        ? {
            __typename: 'ResolveResult',
            state: 'OK',
            remainder: [],
            node: { ...card('welcome-space'), entityType: 'space' },
          }
        : { __typename: 'ResolveResult', state: 'NOT_FOUND', remainder: ['welcome-space'], node: null },
  }),
  V2DashboardHostedResources: () => ({
    viewer: {
      __typename: 'Viewer',
      id: 'user-1',
      account: {
        __typename: 'AccountSummary',
        id: 'account-1',
        canCreate: [],
        hosted: {
          __typename: 'HostedResources',
          spaces: [{ ...card('hosted'), activityScore: 3 }],
          agents: [{ __typename: 'Agent', ...named('vc') }],
          packs: [{ __typename: 'Space', ...named('pack') }],
          homepages: [{ __typename: 'Space', ...named('hub') }],
        },
      },
    },
  }),
  V2RespondToRequest: variables => ({
    respondToRequest: {
      __typename: 'MembershipResult',
      request: {
        __typename: 'MembershipRequest',
        id: variables.id,
        state: 'ACCEPTING',
        availableEvents: [],
        withheldRoles: [],
      },
    },
  }),
  V2DashboardMembershipProbe: () => ({ spaces: { __typename: 'SpaceConnection', edges: [] } }),
  V2DashboardFeedSpaces: () => ({ spaces: { __typename: 'SpaceConnection', edges: [] } }),
});

const renderDashboard = (welcome: 'found' | 'missing' = 'found', pending = true) => {
  const native = createCapturingClient(replies(welcome, pending));
  render(
    <ApolloProvider client={native.client}>
      <DashboardWithoutMemberships dialogState={dialogState} onPendingMembershipsClick={vi.fn()} />
    </ApolloProvider>
  );
  return native;
};

afterEach(() => vi.clearAllMocks());

describe('DashboardWithoutMemberships — native reads', () => {
  test('shows only the viewer’s own space invitations and applications, counts every invitation in one read', async () => {
    const { requests } = renderDashboard();

    await waitFor(() => expect(screen.getAllByTestId('invitation')).toHaveLength(1));
    expect(screen.getByTestId('invitation').textContent).toBe('own-invitation:Jane Doe');
    expect(screen.getAllByTestId('application').map(node => node.textContent)).toEqual(['own-application']);
    // The badge counts every invitation the viewer may act on (space, organization-addressed, organization associate).
    expect(screen.getByTestId('invitations-badge').textContent).toBe('3');
    expect(requests.filter(r => r.operationName === 'V2PendingMemberships')).toHaveLength(1);
    expect(screen.queryByTestId('welcome-block')).toBeNull();
  });

  test('without pending requests the welcome block shows', async () => {
    renderDashboard('found', false);

    expect(await screen.findByTestId('welcome-block')).toBeTruthy();
    expect(screen.queryByTestId('invitation')).toBeNull();
  });

  test('the welcome space is resolved by its handle and shown first, without duplicating it in the ranking', async () => {
    const { requests } = renderDashboard();

    await waitFor(() =>
      expect(screen.getAllByTestId('explore-card').map(node => node.textContent)).toEqual([
        'welcome-space',
        'busy',
        'quiet',
      ])
    );
    expect(requests.find(r => r.operationName === 'V2DashboardWelcomeSpace')?.variables).toEqual({
      url: new URL('/welcome-space', window.location.origin).href,
    });
    const mostActive = requests.find(r => r.operationName === 'V2DashboardMostActiveSpaces');
    expect(mostActive?.variables).toEqual({ days: 7, first: 8 });
    expect(mostActive?.query).toContain('filter: {mostActiveDays: $days, depths: [0, 1], status: [ACTIVE]}');
  });

  test('an environment without a welcome space shows the ranking alone', async () => {
    renderDashboard('missing');

    await waitFor(() =>
      expect(screen.getAllByTestId('explore-card').map(node => node.textContent)).toEqual([
        'busy',
        'welcome-space',
        'quiet',
      ])
    );
  });

  test('the sidebar lists the account’s hosted spaces, VCs, hubs and packs at their server urls', async () => {
    renderDashboard();

    await waitFor(() => expect(screen.getAllByTestId('resource')).toHaveLength(4));
    expect(screen.getAllByTestId('resource').map(node => node.textContent)).toEqual([
      'sidebar.mySpaces:hosted:/hosted:undefined',
      'sidebar.virtualContributors:vc:/vc:/avatar/vc',
      'sidebar.innovationHubs:hub:/hub:/avatar/hub',
      'sidebar.innovationPacks:pack:/pack:/avatar/pack',
    ]);
    expect(screen.getByTestId('create-space-link').textContent).toContain('/user/me');
  });

  test('accepting an invitation answers the request and navigates into the space', async () => {
    const { requests } = renderDashboard();

    await waitFor(() => expect(screen.getAllByTestId('invitation')).toHaveLength(1));
    await act(async () => {
      fireEvent.click(screen.getByTestId('invitation'));
    });

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/a-space'));
    expect(requests.find(r => r.operationName === 'V2RespondToRequest')?.variables).toEqual({
      id: 'own-invitation',
      event: 'ACCEPT',
    });
  });
});
