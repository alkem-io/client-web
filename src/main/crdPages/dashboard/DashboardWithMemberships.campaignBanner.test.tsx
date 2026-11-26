import { ApolloProvider } from '@apollo/client';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { LicenseEntitlementType, RoleName } from '@/core/apollo/generated-v2/legacy-vocabulary';
import { createCapturingClient } from './nativeTestClient';

// workspace#027: the dashboard Virtual Contributor campaign banner is gated on FEATURE_VC_CAMPAIGN (Viewer.platformRoles)
// AND the viewer's own account having account-virtual-contributor available, read natively as
// AccountSummary.canCreate[virtual_contributor].byEntitlement (screens-dispositions.tsv:16196).

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { returnObjects?: boolean }) => (opts?.returnObjects ? [] : key),
  }),
}));

vi.mock('@/core/routing/useNavigate', () => ({
  default: () => vi.fn(),
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => vi.fn(),
}));

let mockPlatformRoles: string[] = [];
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    userModel: { id: 'user-1', settings: { dashboard: { activityView: true } } },
    platformRoles: mockPlatformRoles,
  }),
}));

vi.mock('@/core/foundation/NativeFoundationProvider', () => ({
  useNativeFoundation: () => ({ data: { viewer: { actor: { settings: {} } } } }),
}));

vi.mock('@/domain/community/userCurrent/useHomeSpaceSettings', () => ({
  useHomeSpaceSettings: () => ({ homeSpaceId: undefined, membershipSettingsUrl: '/settings/membership' }),
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
vi.mock('@/crd/components/dashboard/RecentSpaces', () => ({ RecentSpaces: () => <div data-testid="recent-spaces" /> }));
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

const canCreateVc = (allowed: boolean) => [
  {
    __typename: 'CanCreate',
    kind: 'virtual_contributor',
    allowed,
    reason: allowed ? null : 'ENTITLEMENT',
    byEntitlement: [
      { __typename: 'EntitlementAvailability', name: LicenseEntitlementType.AccountVirtualContributor, allowed },
    ],
  },
];

const renderDashboard = (vcAllowed: boolean) => {
  localStorage.setItem('dashboardViewSeeded', '1');
  const native = createCapturingClient({
    V2DashboardRecentSpaces: () => ({
      viewer: { __typename: 'Viewer', id: 'user-1', recentSpaces: [], homeSpace: null },
    }),
    V2DashboardMemberships: () => ({
      viewer: { __typename: 'Viewer', id: 'user-1', actor: { __typename: 'User', id: 'user-1', memberships: [] } },
    }),
    V2DashboardFeedSpaces: () => ({ spaces: { __typename: 'SpaceConnection', edges: [] } }),
    V2DashboardHostedResources: () => ({
      viewer: {
        __typename: 'Viewer',
        id: 'user-1',
        account: {
          __typename: 'AccountSummary',
          id: 'account-1',
          canCreate: canCreateVc(vcAllowed),
          hosted: { __typename: 'HostedResources', spaces: [], agents: [], packs: [], homepages: [] },
        },
      },
    }),
  });
  render(
    <ApolloProvider client={native.client}>
      <DashboardWithMemberships dialogState={dialogState} onPendingMembershipsClick={vi.fn()} />
    </ApolloProvider>
  );
  return native;
};

// The account read was issued and its reply delivered (the capturing link answers on the next macrotask).
const settled = async (requests: ReturnType<typeof renderDashboard>['requests']) => {
  await waitFor(() => expect(requests.map(r => r.operationName)).toContain('V2DashboardHostedResources'));
  await act(() => new Promise(resolve => setTimeout(resolve, 20)));
};

describe('DashboardWithMemberships — VC campaign banner gating (workspace#027 FEATURE_VC_CAMPAIGN)', () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockPlatformRoles = [];
    localStorage.clear();
  });

  test('a holder of FEATURE_VC_CAMPAIGN whose account has the VC entitlement available sees the banner', async () => {
    mockPlatformRoles = [RoleName.FeatureVcCampaign];
    const { requests } = renderDashboard(true);

    expect(await screen.findByTestId('campaign-banner')).toBeTruthy();
    expect(requests.find(r => r.operationName === 'V2DashboardHostedResources')?.query).toContain('byEntitlement');
  });

  test('the retired PLATFORM_VC_CAMPAIGN role no longer targets the banner (Slice B, T013)', async () => {
    mockPlatformRoles = ['PLATFORM_VC_CAMPAIGN', 'FEATURE_VC_CAMPAIGN'];
    const { requests } = renderDashboard(true);

    await settled(requests);
    await screen.findByTestId('recent-spaces');
    expect(screen.queryByTestId('campaign-banner')).toBeNull();
  });

  test('a viewer holding neither campaign role does not see the banner, entitlement or not', async () => {
    mockPlatformRoles = [RoleName.FeatureBetaTester];
    const { requests } = renderDashboard(true);

    await settled(requests);
    await screen.findByTestId('recent-spaces');
    expect(screen.queryByTestId('campaign-banner')).toBeNull();
  });

  test('the role alone is not enough — the VC entitlement must be available on the account', async () => {
    mockPlatformRoles = [RoleName.FeatureVcCampaign];
    const { requests } = renderDashboard(false);

    await settled(requests);
    await screen.findByTestId('recent-spaces');
    expect(screen.queryByTestId('campaign-banner')).toBeNull();
  });
});
