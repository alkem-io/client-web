import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SidebarWidget, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { SpaceTabSidebarConnector } from './SpaceTabSidebarConnector';

let isAuthenticated = true;
const communityDialogMounts = vi.fn();
const activityDialogMounts = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));
vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated }),
}));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    space: {
      id: 'space-1',
      level: SpaceLevel.L0,
      about: { profile: { url: '/space', description: '', displayName: 'Space' }, membership: { roleSetID: 'rs-1' } },
    },
    permissions: { canUpdate: false, canCreateSubspaces: false },
  }),
}));
vi.mock('./SpaceSidebarPortal', () => ({ SpaceSidebarPortal: ({ children }: { children: ReactNode }) => children }));
vi.mock('../useSpaceApplyFlow', () => ({
  useSpaceApplyFlow: () => ({ isMember: false, loading: false, buttonProps: {}, dialogs: null }),
}));
vi.mock('@/main/crdPages/space/isApplyUnavailable', () => ({ isApplyUnavailable: () => true }));
vi.mock('../hooks/useCrdSpaceLeads', () => ({ useCrdSpaceLeads: () => ({ leads: [], loading: false }) }));
vi.mock('../hooks/useCrdSpaceDashboard', () => ({
  useCrdSpaceDashboard: () => ({ dashboardNavigation: undefined, navigationLoading: false }),
}));
vi.mock('../hooks/useCrdCalendarSidebar', () => ({
  useCrdCalendarSidebar: () => ({ events: [], canCreateEvents: false }),
}));
vi.mock('../timeline/useCrdCalendarUrlState', () => ({
  useCrdCalendarUrlState: () => ({ isAnyCalendarRoute: false }),
}));
vi.mock('../hooks/useCrdCommunityUpdates', () => ({
  useCrdCommunityUpdates: () => ({ latest: undefined, total: 0, updates: [], loading: false }),
}));
vi.mock('../hooks/useCrdSpaceCommunity', () => ({
  useCrdSpaceCommunity: () => ({
    leadUsers: [],
    virtualContributors: [],
    hasVcEntitlement: false,
    canInvite: false,
    communityId: undefined,
    roleSetId: undefined,
    guidelines: { id: undefined },
    loading: false,
  }),
}));
vi.mock('../hooks/useCrdSpaceLocale', () => ({ useCrdSpaceLocale: () => undefined }));
vi.mock('../callout/PostIndexDialogConnector', () => ({ PostIndexDialogConnector: () => null }));
vi.mock('../timeline/CrdCalendarDialogConnector', () => ({ CrdCalendarDialogConnector: () => null }));
vi.mock('../dialogs/ContactLeadsDialogConnector', () => ({ ContactLeadsDialogConnector: () => null }));
vi.mock('../dialogs/InviteMembersDialogConnector', () => ({ InviteMembersDialogConnector: () => null }));
vi.mock('../dialogs/SubspacesDialogConnector', () => ({ SubspacesDialogConnector: () => null }));
vi.mock('@/crd/components/space/CommunityUpdatesDialog', () => ({ CommunityUpdatesDialog: () => null }));
vi.mock('../dialogs/CrdSpaceCommunityDialogConnector', () => ({
  CrdSpaceCommunityDialogConnector: (props: unknown) => {
    communityDialogMounts(props);
    return null;
  },
}));
vi.mock('../dialogs/CrdSpaceActivityDialogConnector', () => ({
  CrdSpaceActivityDialogConnector: (props: unknown) => {
    activityDialogMounts(props);
    return null;
  },
}));

const renderConnector = (sidebar: string[]) =>
  render(
    <SpaceTabSidebarConnector
      sidebar={sidebar}
      calloutsSetId="cs-1"
      classificationTagsets={[]}
      tabPosition={0}
      canCreatePost={false}
      onCreatePost={vi.fn()}
      onAboutClick={vi.fn()}
      onCreateSubspace={vi.fn()}
      search={{
        text: '',
        onTextChange: vi.fn(),
        appliedText: '',
        allTags: [],
        selectedTags: [],
        onToggleTag: vi.fn(),
        onClear: vi.fn(),
      }}
    />
  );

describe('SpaceTabSidebarConnector community and activity widgets', () => {
  beforeEach(() => {
    isAuthenticated = true;
    communityDialogMounts.mockClear();
    activityDialogMounts.mockClear();
  });

  test('signed-in viewers see both buttons and both dialogs are mounted', () => {
    renderConnector([SidebarWidget.Community, SidebarWidget.Activity]);
    expect(screen.getByRole('button', { name: 'sidebar.community' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'sidebar.recentActivity' })).toBeInTheDocument();
    expect(communityDialogMounts).toHaveBeenCalledWith(expect.objectContaining({ roleSetId: 'rs-1' }));
    expect(activityDialogMounts).toHaveBeenCalledWith(expect.objectContaining({ spaceId: 'space-1' }));
  });

  test('anonymous viewers get Community only and no activity dialog', () => {
    isAuthenticated = false;
    renderConnector([SidebarWidget.Community, SidebarWidget.Activity]);
    expect(screen.getByRole('button', { name: 'sidebar.community' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'sidebar.recentActivity' })).not.toBeInTheDocument();
    expect(activityDialogMounts).not.toHaveBeenCalled();
  });

  test('neither widget configured: no buttons and no dialogs mounted', () => {
    renderConnector([SidebarWidget.Index]);
    expect(screen.queryByRole('button', { name: 'sidebar.community' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'sidebar.recentActivity' })).not.toBeInTheDocument();
    expect(communityDialogMounts).not.toHaveBeenCalled();
    expect(activityDialogMounts).not.toHaveBeenCalled();
  });

  test('renders the widgets in the configured order', () => {
    renderConnector([SidebarWidget.Activity, SidebarWidget.Index, SidebarWidget.Community]);
    const labels = screen.getAllByRole('button').map(button => button.textContent);
    expect(labels).toEqual(['sidebar.recentActivity', 'sidebar.postIndex', 'sidebar.community']);
  });
});
