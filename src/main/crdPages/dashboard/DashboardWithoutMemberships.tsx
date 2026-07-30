import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardExploreSpacesQuery, usePendingInvitationsQuery } from '@/core/apollo/generated/apollo-hooks';
import { LicenseEntitlementType, RoleName } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { ApplicationsBlock } from '@/crd/components/dashboard/ApplicationsBlock';
import { CampaignBanner } from '@/crd/components/dashboard/CampaignBanner';
import { CompactSpaceCard, CompactSpaceCardSkeleton } from '@/crd/components/dashboard/CompactSpaceCard';
import { DashboardLayout } from '@/crd/components/dashboard/DashboardLayout';
import { DashboardSidebar } from '@/crd/components/dashboard/DashboardSidebar';
import { InvitationsBlock } from '@/crd/components/dashboard/InvitationsBlock';
import { TipsAndTricksDialog } from '@/crd/components/dashboard/TipsAndTricksDialog';
import { WelcomeBlock } from '@/crd/components/dashboard/WelcomeBlock';
import { Badge } from '@/crd/primitives/badge';
import useInvitationActions from '@/domain/community/invitations/useInvitationActions';
import { usePendingMemberships } from '@/domain/community/pendingMembership/PendingMemberships';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { CrdVCCreationWizardDialog } from '@/main/crdPages/topLevelPages/vcPages/creationWizard/CrdVCCreationWizardDialog';
import { buildWelcomeSpaceUrl, URL_SPACE_EXPLORER } from '@/main/routing/urlBuilders';
import { mapApplicationsToCards, mapInvitationsToCards, mapMostActivitySection } from './dashboardDataMappers';
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

const EXPLORE_LIMIT = 8;
const EXPLORE_ACTIVITY_DAYS = 7;

export default function DashboardWithoutMemberships({
  dialogState,
  onPendingMembershipsClick,
}: DashboardWithoutMembershipsProps) {
  const { t } = useTranslation('crd-dashboard');
  const navigate = useNavigate();
  const { platformRoles, accountEntitlements } = useCurrentUserContext();
  const [createVcOpen, setCreateVcOpen] = useState(false);

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

  // Applications. No count query exists for these, so the block is driven by the
  // list itself and renders nothing until it resolves non-empty.
  const { applications } = usePendingMemberships({ skip: false });
  const applicationCards = mapApplicationsToCards(applications ?? []);
  const hasApplications = applicationCards.length > 0;

  // Combined pending total (FR-015): applications + invitations.
  const pendingTotal = applicationCards.length + pendingCount;
  const hasPending = pendingTotal > 0;

  // Explore Spaces — compact block: up to 8 most-active Spaces (welcome Space first when
  // it is among them), no search/filter chrome (FR-020).
  const { data: exploreData, loading: exploreLoading } = useDashboardExploreSpacesQuery({
    variables: { daysOld: EXPLORE_ACTIVITY_DAYS, limit: EXPLORE_LIMIT },
  });
  const exploreCards = (() => {
    const cards = mapMostActivitySection(exploreData?.exploreSpaces ?? []);
    // Splice the welcome Space to the front when it is present in the ranking. Its id is
    // not resolved here (no dedicated lookup), so we match on its stable route; when it is
    // not among the active Spaces the block degrades gracefully to the ranking order.
    const welcomeHref = buildWelcomeSpaceUrl();
    const welcomeIndex = cards.findIndex(card => card.href === welcomeHref);
    if (welcomeIndex > 0) {
      const [welcome] = cards.splice(welcomeIndex, 1);
      cards.unshift(welcome);
    }
    return cards;
  })();

  // Campaign
  const showCampaign =
    platformRoles?.some(role => role === RoleName.PlatformVcCampaign) &&
    accountEntitlements?.some(e => e === LicenseEntitlementType.AccountVirtualContributor);

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
        {hasPending ? (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-section-title">{t('pending.title')}</h2>
              <Badge variant="secondary" className="shrink-0">
                {pendingTotal}
              </Badge>
            </div>

            {hasApplications && <ApplicationsBlock applications={applicationCards} />}

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
          </section>
        ) : (
          <WelcomeBlock
            message={t('welcome.message')}
            welcomeSpaceHref={buildWelcomeSpaceUrl()}
            documentationHref={t('welcome.documentationUrl')}
          />
        )}

        {showCampaign && <CampaignBanner onAction={() => setCreateVcOpen(true)} />}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-section-title">{t('explore.title')}</h2>
            <button
              type="button"
              onClick={() => navigate(URL_SPACE_EXPLORER)}
              className="flex items-center gap-1 text-body-emphasis text-primary transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
            >
              {t('explore.exploreAll')} <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exploreLoading && exploreCards.length === 0
              ? // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                Array.from({ length: EXPLORE_LIMIT }).map((_, i) => (
                  <li key={i}>
                    <CompactSpaceCardSkeleton />
                  </li>
                ))
              : exploreCards.map(card => (
                  <li key={card.id}>
                    <CompactSpaceCard {...card} />
                  </li>
                ))}
          </ul>
        </section>
      </DashboardLayout>

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

      {createVcOpen && <CrdVCCreationWizardDialog open={true} onClose={() => setCreateVcOpen(false)} />}
    </>
  );
}
