import { defer } from 'lodash-es';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActorType, RoleName } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { ReferencesAndTagsStrip } from '@/crd/components/callout/ReferencesAndTagsStrip';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { InvitationDetailDialog } from '@/crd/components/dashboard/InvitationDetailDialog';
import { PendingApplicationCard } from '@/crd/components/dashboard/PendingApplicationCard';
import { PendingInvitationCard, PendingInvitationCardSkeleton } from '@/crd/components/dashboard/PendingInvitationCard';
import { PendingMembershipsListDialog } from '@/crd/components/dashboard/PendingMembershipsListDialog';
import { PendingMembershipsSection } from '@/crd/components/dashboard/PendingMembershipsSection';
import useInvitationActions from '@/domain/community/invitations/useInvitationActions';
import type { InvitationWithMeta } from '@/domain/community/pendingMembership/PendingMemberships';
import {
  useApplicationHydrator,
  useInvitationHydrator,
  usePendingMemberships,
} from '@/domain/community/pendingMembership/PendingMemberships';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import type { PendingApplicationItem } from '@/domain/community/user/models/PendingApplicationItem';
import type { PendingInvitationItem } from '@/domain/community/user/models/PendingInvitationItem';
import DetailedActivityDescription from '@/domain/shared/components/ActivityDescription/DetailedActivityDescription';
import {
  mapHydratedApplicationToCardData,
  mapHydratedInvitationToCardData,
  mapHydratedInvitationToDetailData,
} from './pendingMembershipsDataMappers';

// ─── Pure helpers (exported for unit testing — T014) ───────────────────────

/**
 * Neither VC nor organization invitations navigate to the space on accept —
 * VCs aren't a space the current user visits, and an org invitation is acted
 * on by an org admin who isn't necessarily joining the space themselves (R4).
 * Both return to the pending-memberships list instead (`onInvitationAccept`
 * falls through to `setOpenDialog({ type: PendingMembershipsList })` whenever
 * `openDialog.spaceUri` is undefined).
 */
export const resolveInvitationSpaceUri = (actorType: ActorType | undefined, spaceUrl: string): string | undefined => {
  const returnsToList = actorType === ActorType.VirtualContributor || actorType === ActorType.Organization;
  return returnsToList ? undefined : spaceUrl;
};

/** Splits the flat invitation list into the three sections the list dialog renders. */
export const classifyInvitations = <T extends { invitation: { actor?: { type: ActorType } } }>(
  invitations: T[] | undefined
): {
  userInvitations: T[] | undefined;
  organizationInvitations: T[] | undefined;
  virtualContributorInvitations: T[] | undefined;
} => ({
  userInvitations: invitations?.filter(
    inv =>
      inv.invitation.actor?.type !== ActorType.VirtualContributor &&
      inv.invitation.actor?.type !== ActorType.Organization
  ),
  organizationInvitations: invitations?.filter(inv => inv.invitation.actor?.type === ActorType.Organization),
  virtualContributorInvitations: invitations?.filter(
    inv => inv.invitation.actor?.type === ActorType.VirtualContributor
  ),
});

// ─── Per-item hydration wrappers ────────────────────────────────────────────

const HydratedInvitationCard = ({
  invitation,
  onClick,
}: {
  invitation: PendingInvitationItem;
  onClick: (inv: InvitationWithMeta) => void;
}) => {
  const { t } = useTranslation();
  const { invitation: hydrated } = useInvitationHydrator(invitation);

  if (!hydrated) {
    return (
      <li>
        <PendingInvitationCardSkeleton />
      </li>
    );
  }

  const cardData = mapHydratedInvitationToCardData(hydrated, t);

  return (
    <li>
      <PendingInvitationCard invitation={cardData} onClick={() => onClick(hydrated)} />
    </li>
  );
};

const HydratedApplicationCard = ({
  application,
  onClick,
}: {
  application: PendingApplicationItem;
  onClick: (url: string) => void;
}) => {
  const { application: hydrated } = useApplicationHydrator(application);

  if (!hydrated) {
    return null;
  }

  const cardData = mapHydratedApplicationToCardData(hydrated);

  return (
    <li>
      <PendingApplicationCard application={cardData} onClick={() => onClick(hydrated.space.about.profile.url)} />
    </li>
  );
};

// ─── Invitation Detail Container ────────────────────────────────────────────

const InvitationDetailContainer = ({
  open,
  currentInvitation,
  onAccept,
  onReject,
  onClose,
  onBack,
}: {
  open: boolean;
  currentInvitation: PendingInvitationItem | undefined;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
  onBack: () => void;
}) => {
  const { t } = useTranslation('crd-dashboard');
  const { t: tMain, i18n } = useTranslation();

  const { invitation: hydrated, communityGuidelines } = useInvitationHydrator(currentInvitation, {
    withCommunityGuidelines: true,
  });

  const props = useInvitationActions({
    onAccept: () => onAccept(),
    onReject: () => onReject(),
    spaceId: currentInvitation?.spacePendingMembershipInfo.id,
  });

  if (!hydrated) {
    return null;
  }

  const isVC = hydrated.invitation.actor?.type === ActorType.VirtualContributor;
  const isOrg = hydrated.invitation.actor?.type === ActorType.Organization;

  const title = isOrg
    ? t('pendingMemberships.orgInvitationDialog.title', {
        organizationName: hydrated.invitation.actor?.profile?.displayName ?? '',
      })
    : isVC
      ? tMain('community.pendingMembership.invitationDialog.vc.title', {
          space: hydrated.space.about.profile.displayName,
        })
      : tMain('community.pendingMembership.invitationDialog.title', {
          space: hydrated.space.about.profile.displayName,
        });

  const acceptLabel = isVC || isOrg ? t('pendingMemberships.detail.accept') : t('pendingMemberships.detail.join');
  const rejectLabel = t('pendingMemberships.detail.reject');

  const detailData = mapHydratedInvitationToDetailData(hydrated, i18n.language);

  // The offered role + every Space the organization joins on accept (D7) — organization
  // invitations only; the generic activity description above already covers user/VC invites.
  const roleText = hydrated.invitation.extraRoles?.includes(RoleName.Lead)
    ? `${tMain('member')} + ${tMain('lead')}`
    : tMain('member');
  const spacesToJoin = hydrated.invitation.spacesToJoinOnAccept ?? [];

  const descriptionSlot = (
    <div className="text-caption text-muted-foreground">
      <DetailedActivityDescription
        i18nKey="community.pendingMembership.invitationCardTitle"
        spaceDisplayName={hydrated.space.about.profile.displayName}
        spaceUrl={hydrated.space.about.profile.url}
        spaceLevel={hydrated.space.level}
        createdDate={hydrated.invitation.createdDate}
        author={{ displayName: hydrated.userDisplayName }}
        type={hydrated.invitation.actor?.type}
      />
      {isOrg && (
        <p className="mt-1">
          {t('pendingMemberships.orgInvitationDialog.role')}: {roleText}
          {spacesToJoin.length > 1 &&
            ` · ${t('pendingMemberships.orgInvitationDialog.spacesToJoin', {
              spaces: spacesToJoin.map(space => space.profile.displayName).join(', '),
            })}`}
        </p>
      )}
    </div>
  );

  const welcomeMessageSlot = hydrated.invitation.welcomeMessage ? (
    <p className="text-body">{hydrated.invitation.welcomeMessage}</p>
  ) : undefined;

  const guidelinesSlot = communityGuidelines ? (
    <>
      <h3 className="text-card-title pt-2">{communityGuidelines.profile.displayName}</h3>
      <div className="flex flex-col gap-2">
        <div className="break-words">
          <MarkdownContent content={communityGuidelines.profile.description ?? ''} />
        </div>
        <ReferencesAndTagsStrip references={communityGuidelines.profile.references} />
      </div>
    </>
  ) : undefined;

  return (
    <InvitationDetailDialog
      open={open}
      onClose={onClose}
      onBack={onBack}
      invitation={detailData}
      title={title}
      acceptLabel={acceptLabel}
      rejectLabel={rejectLabel}
      descriptionSlot={descriptionSlot}
      welcomeMessageSlot={welcomeMessageSlot}
      guidelinesSlot={guidelinesSlot}
      onAccept={() => props.acceptInvitation(hydrated.invitation.id, hydrated.space.about.profile.url)}
      accepting={props.accepting}
      onReject={() => props.rejectInvitation(hydrated.invitation.id)}
      rejecting={props.rejecting}
      updating={props.updating}
    />
  );
};

// ─── Main Dialog ────────────────────────────────────────────────────────────

const CrdPendingMembershipsDialog = () => {
  const { t } = useTranslation('crd-dashboard');
  const navigate = useNavigate();
  const { openDialog, setOpenDialog } = usePendingMembershipsDialog();

  const closeDialog = () => setOpenDialog(undefined);

  const isDialogOpen = Object.values(PendingMembershipsDialogType).includes(openDialog?.type ?? '');
  const isPendingMembershipsList = openDialog?.type === PendingMembershipsDialogType.PendingMembershipsList;

  const { invitations, applications, loading, refetch } = usePendingMemberships({
    skip: !isDialogOpen,
  });

  useEffect(() => {
    if (isPendingMembershipsList) {
      refetch();
    }
  }, [isPendingMembershipsList, refetch]);

  const handleInvitationCardClick = ({ id, space, invitation }: InvitationWithMeta) => {
    setOpenDialog({
      type: PendingMembershipsDialogType.InvitationView,
      invitationId: id,
      spaceUri: resolveInvitationSpaceUri(invitation.actor?.type, space.about.profile.url),
    });
  };

  const handleSpaceCardClick = (spaceUrl: string) => {
    closeDialog();
    navigate(spaceUrl);
  };

  const currentInvitation =
    openDialog?.type === PendingMembershipsDialogType.InvitationView
      ? invitations?.find(inv => inv.id === openDialog.invitationId)
      : undefined;

  const { userInvitations, organizationInvitations, virtualContributorInvitations } = classifyInvitations(invitations);

  const isEmpty =
    !userInvitations?.length &&
    !organizationInvitations?.length &&
    !virtualContributorInvitations?.length &&
    !applications?.length;

  const onInvitationAccept = () => {
    if (openDialog?.spaceUri) {
      navigate(openDialog.spaceUri);
      defer(closeDialog);
    } else {
      setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList });
    }
  };

  const onInvitationReject = () => {
    setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList });
  };

  return (
    <>
      <PendingMembershipsListDialog
        open={isPendingMembershipsList}
        onClose={closeDialog}
        loading={loading}
        empty={isEmpty}
      >
        {userInvitations?.length ? (
          <PendingMembershipsSection title={t('pendingMemberships.invitationsSection')}>
            {userInvitations.map(inv => (
              <HydratedInvitationCard key={inv.id} invitation={inv} onClick={handleInvitationCardClick} />
            ))}
          </PendingMembershipsSection>
        ) : null}

        {organizationInvitations?.length ? (
          <PendingMembershipsSection title={t('pendingMemberships.orgInvitationsSection')}>
            {organizationInvitations.map(inv => (
              <HydratedInvitationCard key={inv.id} invitation={inv} onClick={handleInvitationCardClick} />
            ))}
          </PendingMembershipsSection>
        ) : null}

        {virtualContributorInvitations?.length ? (
          <PendingMembershipsSection title={t('pendingMemberships.vcInvitationsSection')}>
            {virtualContributorInvitations.map(inv => (
              <HydratedInvitationCard key={inv.id} invitation={inv} onClick={handleInvitationCardClick} />
            ))}
          </PendingMembershipsSection>
        ) : null}

        {applications?.length ? (
          <PendingMembershipsSection title={t('pendingMemberships.applicationsSection')}>
            {applications.map(app => (
              <HydratedApplicationCard key={app.id} application={app} onClick={handleSpaceCardClick} />
            ))}
          </PendingMembershipsSection>
        ) : null}
      </PendingMembershipsListDialog>

      <InvitationDetailContainer
        open={openDialog?.type === PendingMembershipsDialogType.InvitationView}
        currentInvitation={currentInvitation}
        onAccept={onInvitationAccept}
        onReject={onInvitationReject}
        onClose={closeDialog}
        onBack={() => setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList })}
      />
    </>
  );
};

export default CrdPendingMembershipsDialog;
