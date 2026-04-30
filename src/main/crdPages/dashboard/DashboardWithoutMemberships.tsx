import { useTranslation } from 'react-i18next';
import { usePendingInvitationsQuery } from '@/core/apollo/generated/apollo-hooks';
import { LicenseEntitlementType, RoleName } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { CampaignBanner } from '@/crd/components/dashboard/CampaignBanner';
import { DashboardLayout } from '@/crd/components/dashboard/DashboardLayout';
import { DashboardSidebar } from '@/crd/components/dashboard/DashboardSidebar';
import { InvitationsBlock } from '@/crd/components/dashboard/InvitationsBlock';
import { TipsAndTricksDialog } from '@/crd/components/dashboard/TipsAndTricksDialog';
import { SpaceExplorer } from '@/crd/components/space/SpaceExplorer';
import useInvitationActions from '@/domain/community/invitations/useInvitationActions';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { mapSpacesToCardDataList } from '@/main/crdPages/spaces/spaceCardDataMapper';
import useSpaceExplorer from '@/main/crdPages/spaces/useSpaceExplorer';
import useVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard';
import { mapInvitationsToCards } from './dashboardDataMappers';
import type { DashboardDialogType } from './useDashboardDialogs';
import { useDashboardSidebar } from './useDashboardSidebar';

type DashboardWithoutMembershipsProps = {
  dialogState: {
    openDialog: DashboardDialogType | null;
    openTipsAndTricks: () => void;
    openMyActivity: () => void;
    openMySpaceActivity: () => void;
    openMemberships: () => void;
    closeDialog: () => void;
  };
  onPendingMembershipsClick: () => void;
};

export default function DashboardWithoutMemberships({
  dialogState,
  onPendingMembershipsClick,
}: DashboardWithoutMembershipsProps) {
  const { t } = useTranslation('crd-dashboard');
  const navigate = useNavigate();
  const { platformRoles, accountEntitlements } = useCurrentUserContext();

  const { acceptInvitation, rejectInvitation } = useInvitationActions({
    onAccept: spaceUrl => navigate(spaceUrl),
  });

  const sidebarData = useDashboardSidebar({
    onInvitationsClick: onPendingMembershipsClick,
    onTipsAndTricksClick: dialogState.openTipsAndTricks,
  });

  // Invitations
  const { count: pendingCount } = usePendingInvitationsCount();
  const { data: invitationsData, loading: invitationsLoading } = usePendingInvitationsQuery({
    skip: pendingCount === 0,
  });
  const invitations = mapInvitationsToCards(
    (invitationsData?.me.communityInvitations ?? []) as Parameters<typeof mapInvitationsToCards>[0]
  );
  const hasInvitations = pendingCount > 0;

  // Explore spaces
  const {
    spaces,
    searchTerms,
    setSearchTerms,
    loading: spacesLoading,
    hasMore,
    fetchMore,
    membershipFilter,
    onMembershipFilterChange,
    authenticated,
    loadingSearchResults,
  } = useSpaceExplorer();
  const cardData = mapSpacesToCardDataList(spaces, authenticated);

  // Campaign
  const showCampaign =
    platformRoles?.some(role => role === RoleName.PlatformVcCampaign) &&
    accountEntitlements?.some(e => e === LicenseEntitlementType.AccountVirtualContributor);
  const { startWizard, virtualContributorWizard } = useVirtualContributorWizard();

  return (
    <>
      <DashboardLayout
        sidebar={
          <DashboardSidebar
            menuItems={sidebarData.menuItems}
            resourceSections={sidebarData.resourceSections}
            showActivityToggle={false}
          />
        }
      >
        {hasInvitations && (
          <InvitationsBlock
            invitations={invitations}
            loading={invitationsLoading}
            onAccept={id => {
              const invitation = invitations.find(inv => inv.id === id);
              if (invitation) {
                acceptInvitation(id, invitation.spaceHref);
              }
            }}
            onDecline={id => rejectInvitation(id)}
          />
        )}

        {showCampaign && <CampaignBanner onAction={() => startWizard()} />}

        <SpaceExplorer
          spaces={cardData}
          loading={spacesLoading}
          hasMore={hasMore}
          searchTerms={searchTerms}
          membershipFilter={membershipFilter}
          authenticated={authenticated}
          loadingSearchResults={loadingSearchResults}
          onLoadMore={fetchMore}
          onSearchTermsChange={terms => setSearchTerms(terms)}
          onMembershipFilterChange={onMembershipFilterChange}
          onParentClick={parent => navigate(parent.href)}
          gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          className="max-w-none mx-0 px-0 sm:px-0 py-0"
        />
      </DashboardLayout>
      {virtualContributorWizard}

      <TipsAndTricksDialog
        open={dialogState.openDialog === 'tips-and-tricks'}
        onClose={dialogState.closeDialog}
        tips={(() => {
          const raw = t('tips.items', { returnObjects: true });
          const arr: Array<{ title: string; description: string; imageUrl?: string; url?: string }> = Array.isArray(raw)
            ? raw
            : [];
          return arr.map((item, i) => ({
            id: String(i),
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            href: item.url,
          }));
        })()}
        findMoreHref={t('dialogs.findMoreUrl')}
        findMoreLabel={t('dialogs.findMore')}
      />
    </>
  );
}
