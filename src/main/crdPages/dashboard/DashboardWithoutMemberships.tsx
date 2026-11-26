import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useV2DashboardHostedResourcesQuery,
  useV2DashboardMostActiveSpacesQuery,
  useV2DashboardWelcomeSpaceQuery,
} from '@/core/apollo/generated-v2/apollo-hooks';
import { useReportedQueryError } from '@/core/apollo/hooks/useReportedQueryError';
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
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { CrdVCCreationWizardDialog } from '@/main/crdPages/topLevelPages/vcPages/creationWizard/CrdVCCreationWizardDialog';
import { buildWelcomeSpaceUrl, URL_SPACE_EXPLORER } from '@/main/routing/urlBuilders';
import {
  type DashboardSpace,
  mapApplicationsToCards,
  mapInvitationsToCards,
  mapMostActivitySection,
} from './dashboardDataMappers';
import { isVcCampaignTargeted, isVcCreationAvailable } from './isVcCampaignTargeted';
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
// The platform welcome Space is the entity with handle `welcome-space` (client-repoint.md:333), at its route.
const welcomeSpaceAbsoluteUrl = () => new URL(buildWelcomeSpaceUrl(), window.location.origin).href;

export default function DashboardWithoutMemberships({
  dialogState,
  onPendingMembershipsClick,
}: DashboardWithoutMembershipsProps) {
  const { t } = useTranslation('crd-dashboard');
  const navigate = useNavigate();
  const { platformRoles } = useCurrentUserContext();
  const [createVcOpen, setCreateVcOpen] = useState(false);

  const { acceptInvitation, rejectInvitation } = useInvitationActions({
    onAccept: spaceUrl => navigate(spaceUrl),
  });

  const sidebarData = useDashboardSidebar({
    onInvitationsClick: onPendingMembershipsClick,
    onTipsAndTricksClick: dialogState.openTipsAndTricks,
  });

  // Invitations and applications: one Viewer.pendingInvitations / pendingApplications read
  // (screens-dispositions.tsv:10985-10986). The Space invitations carry those addressed to the
  // ORGANIZATIONS and Virtual Contributors this user acts for alongside their own. This block
  // renders each entry as "You've been invited to <Space>" with Accept/Decline and navigates
  // into the Space on accept — none of which is true for an invitation addressed to an
  // organization, whose acceptance is a consent decision on the organization's behalf and joins
  // the ORGANIZATION, not the viewer. Those belong in the pending-memberships dialog, which
  // classifies them into their own section (`classifyInvitations`), so keep only the viewer's own
  // here (the invited actor is a user).
  const {
    invitations: spaceInvitations,
    applications,
    loading: pendingLoading,
  } = usePendingMemberships({ skip: false });
  const ownInvitations = (spaceInvitations ?? []).filter(request => request.actor?.actorType === 'user');
  const invitations = mapInvitationsToCards(ownInvitations);
  const hasInvitations = invitations.length > 0;

  // Applications: the block is driven by the list itself and renders nothing until it resolves non-empty.
  const applicationCards = mapApplicationsToCards(applications ?? []);
  const hasApplications = applicationCards.length > 0;

  // Combined pending total (FR-015): applications + the viewer's own invitations. Every pending
  // source resolves in the one read before choosing pending-vs-welcome.
  const pendingTotal = applicationCards.length + invitations.length;
  const hasPending = pendingTotal > 0;

  // Explore Spaces — compact block: up to 8 most-active Spaces (welcome Space first when
  // it is among them), no search/filter chrome (FR-020).
  const {
    data: exploreData,
    loading: exploreLoading,
    error: exploreError,
  } = useV2DashboardMostActiveSpacesQuery({
    variables: { days: EXPLORE_ACTIVITY_DAYS, first: EXPLORE_LIMIT },
  });
  useReportedQueryError(exploreError);
  // The welcome Space is resolved by its handle so it can be shown first even when it isn't
  // among the most-active ranking (new users need it most). FR-020. An environment without a
  // welcome Space resolves NOT_FOUND (or a shorter prefix): absence, and the ranking alone shows.
  const {
    data: welcomeData,
    loading: welcomeLoading,
    error: welcomeError,
  } = useV2DashboardWelcomeSpaceQuery({ variables: { url: welcomeSpaceAbsoluteUrl() } });
  useReportedQueryError(welcomeError);
  const exploreCards = (() => {
    const ranked = mapMostActivitySection(exploreData?.spaces.edges.map(edge => edge.node) ?? []);
    const resolved = welcomeData?.resolve;
    const welcomeSpace =
      resolved?.state === 'OK' && resolved.remainder.length === 0 && resolved.node?.entityType === 'space'
        ? (resolved.node as DashboardSpace)
        : undefined;
    if (!welcomeSpace) return ranked;
    const [welcomeCard] = mapMostActivitySection([welcomeSpace]);
    // Welcome Space always first; drop any duplicate from the ranking, then cap the row.
    return [welcomeCard, ...ranked.filter(card => card.id !== welcomeCard.id)].slice(0, EXPLORE_LIMIT);
  })();

  // Campaign (screens-dispositions.tsv:16196); the sidebar's account document carries canCreate.
  const { data: accountData, error: accountError } = useV2DashboardHostedResourcesQuery();
  useReportedQueryError(accountError);
  const showCampaign =
    isVcCampaignTargeted(platformRoles) && isVcCreationAvailable(accountData?.viewer.account?.canCreate);

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
        {pendingLoading ? null : hasPending ? (
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
                loading={pendingLoading}
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
            {(exploreLoading || welcomeLoading) && exploreCards.length === 0
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
