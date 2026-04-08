import { defer } from 'lodash-es';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle, Caption, Text } from '@/core/ui/typography';
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
import References from '@/domain/shared/components/References/References';
import {
  mapHydratedApplicationToCardData,
  mapHydratedInvitationToCardData,
  mapHydratedInvitationToDetailData,
} from './pendingMembershipsDataMappers';

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
  const { t: tMain } = useTranslation();

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

  const title = isVC
    ? tMain('community.pendingMembership.invitationDialog.vc.title', {
        space: hydrated.space.about.profile.displayName,
      })
    : tMain('community.pendingMembership.invitationDialog.title', {
        space: hydrated.space.about.profile.displayName,
      });

  const acceptLabel = isVC ? t('pendingMemberships.detail.accept') : t('pendingMemberships.detail.join');
  const rejectLabel = t('pendingMemberships.detail.reject');

  const detailData = mapHydratedInvitationToDetailData(hydrated, tMain);

  const descriptionSlot = (
    <Caption>
      <DetailedActivityDescription
        i18nKey="community.pendingMembership.invitationTitle"
        spaceDisplayName={hydrated.space.about.profile.displayName}
        spaceUrl={hydrated.space.about.profile.url}
        spaceLevel={hydrated.space.level}
        createdDate={hydrated.invitation.createdDate}
        author={{ displayName: hydrated.userDisplayName }}
        type={hydrated.invitation.actor?.type}
      />
    </Caption>
  );

  const welcomeMessageSlot = hydrated.invitation.welcomeMessage ? (
    <Text>{hydrated.invitation.welcomeMessage}</Text>
  ) : undefined;

  const guidelinesSlot = communityGuidelines ? (
    <>
      <BlockSectionTitle paddingTop={gutters()}>{communityGuidelines.profile.displayName}</BlockSectionTitle>
      <Gutters disablePadding={true}>
        <div style={{ wordWrap: 'break-word' }}>
          <WrapperMarkdown disableParagraphPadding={true}>
            {communityGuidelines.profile.description ?? ''}
          </WrapperMarkdown>
        </div>
        <References compact={true} references={communityGuidelines.profile.references} />
      </Gutters>
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
      spaceUri: invitation.actor?.type === ActorType.VirtualContributor ? undefined : space.about.profile.url,
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

  const virtualContributorInvitations = invitations?.filter(
    inv => inv.invitation.actor?.type === ActorType.VirtualContributor
  );

  const nonVirtualContributorInvitations = invitations?.filter(
    inv => inv.invitation.actor?.type !== ActorType.VirtualContributor
  );

  const isEmpty =
    !nonVirtualContributorInvitations?.length && !virtualContributorInvitations?.length && !applications?.length;

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
        isEmpty={isEmpty}
      >
        {nonVirtualContributorInvitations?.length ? (
          <PendingMembershipsSection title={t('pendingMemberships.invitationsSection')}>
            {nonVirtualContributorInvitations.map(inv => (
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
