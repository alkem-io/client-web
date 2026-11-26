import { ApolloProvider } from '@apollo/client';
import { render, screen, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { expect, test, vi } from 'vitest';
import { createCapturingClient } from './nativeTestClient';

// Legacy dashboard sections fail independently: a failed read is reported and its section renders without data, the
// rest of /home stays (Pi 2026-11-25: RecentSpaces 422 and HostedResources UNAVAILABLE hid Create space and Pending
// Memberships).
const handleErrorMock = vi.fn();
vi.mock('@/core/apollo/hooks/useApolloErrorHandler', () => ({ useApolloErrorHandler: () => handleErrorMock }));

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

const mockPlatformRoles: string[] = [];
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
vi.mock('@/crd/components/dashboard/DashboardSidebar', () => ({
  DashboardSidebar: () => <nav data-testid="sidebar" />,
}));

vi.mock('@/crd/components/dashboard/ActivityDialog', () => ({ ActivityDialog: () => null }));
vi.mock('@/crd/components/dashboard/ActivityFeed', () => ({ ActivityFeed: () => null }));
vi.mock('@/crd/components/dashboard/CampaignBanner', () => ({
  CampaignBanner: () => <div data-testid="campaign-banner" />,
}));
vi.mock('@/crd/components/dashboard/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/crd/components/dashboard/MyMemberships/MyMembershipsPanel', () => ({
  MyMembershipsPanel: () => <div data-testid="memberships" />,
}));
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

test('a failing section is reported and the rest of the dashboard still renders', async () => {
  localStorage.setItem('dashboardViewSeeded', '1');
  const native = createCapturingClient({
    V2DashboardRecentSpaces: () => {
      throw new GraphQLError('unprocessable', { extensions: { code: 'VALIDATION' } });
    },
    V2DashboardHostedResources: () => {
      throw new GraphQLError('unavailable', { extensions: { code: 'UNAVAILABLE' } });
    },
    V2DashboardMemberships: () => ({
      viewer: { __typename: 'Viewer', id: 'user-1', actor: { __typename: 'User', id: 'user-1', memberships: [] } },
    }),
    V2DashboardFeedSpaces: () => ({ spaces: { __typename: 'SpaceConnection', edges: [] } }),
  });
  render(
    <ApolloProvider client={native.client}>
      <DashboardWithMemberships dialogState={dialogState} onPendingMembershipsClick={vi.fn()} />
    </ApolloProvider>
  );

  await waitFor(() => expect(handleErrorMock).toHaveBeenCalledTimes(2));
  expect(screen.getByTestId('recent-spaces')).toBeInTheDocument();
  expect(screen.getByTestId('memberships')).toBeInTheDocument();
});
