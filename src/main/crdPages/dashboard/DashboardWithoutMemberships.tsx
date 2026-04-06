import { Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePendingInvitationsQuery } from '@/core/apollo/generated/apollo-hooks';
import { LicenseEntitlementType, RoleName } from '@/core/apollo/generated/graphql-schema';
import { CampaignBanner } from '@/crd/components/dashboard/CampaignBanner';
import { DashboardLayout } from '@/crd/components/dashboard/DashboardLayout';
import { DashboardSidebar } from '@/crd/components/dashboard/DashboardSidebar';
import { InvitationsBlock } from '@/crd/components/dashboard/InvitationsBlock';
import { Button } from '@/crd/primitives/button';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard';
import { useCreateSpaceLink } from '@/main/topLevelPages/myDashboard/useCreateSpaceLink/useCreateSpaceLink';
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

const noop = () => {};

export default function DashboardWithoutMemberships({
  dialogState,
  onPendingMembershipsClick,
}: DashboardWithoutMembershipsProps) {
  const { t } = useTranslation('crd-dashboard');
  const { platformRoles, accountEntitlements } = useCurrentUserContext();

  const sidebarData = useDashboardSidebar({
    onInvitationsClick: onPendingMembershipsClick,
    onTipsAndTricksClick: dialogState.openTipsAndTricks,
  });

  const { count: pendingCount } = usePendingInvitationsCount();
  const { data: invitationsData, loading: invitationsLoading } = usePendingInvitationsQuery({
    skip: pendingCount === 0,
  });
  const invitations = mapInvitationsToCards(
    (invitationsData?.me.communityInvitations ?? []) as Parameters<typeof mapInvitationsToCards>[0]
  );

  const { link: createSpaceLink } = useCreateSpaceLink();

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
            activityEnabled={false}
            onActivityToggle={noop}
          />
        }
      >
        {showCampaign && <CampaignBanner onAction={() => startWizard()} />}

        <InvitationsBlock
          invitations={invitations}
          loading={invitationsLoading}
          onAccept={id => {
            const invitation = invitations.find(inv => inv.id === id);
            if (invitation?.spaceHref) {
              window.location.href = invitation.spaceHref;
            }
          }}
          onDecline={noop}
        />

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">{t('withoutMemberships.createSpace')}</h3>
          <p className="text-sm text-muted-foreground">{t('withoutMemberships.createSpaceDescription')}</p>
          <Button asChild={true}>
            <a href={createSpaceLink}>
              <Rocket className="h-4 w-4" aria-hidden="true" />
              {t('withoutMemberships.createSpace')}
            </a>
          </Button>
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">{t('dialogs.findMore')}</h3>
          <Button variant="outline" asChild={true}>
            <a href="/spaces">{t('dialogs.seeMoreSpaces')}</a>
          </Button>
        </section>
      </DashboardLayout>
      {virtualContributorWizard}
    </>
  );
}
