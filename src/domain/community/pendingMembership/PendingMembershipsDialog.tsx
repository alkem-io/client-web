import { HdrStrongOutlined } from '@mui/icons-material';
import { defer } from 'lodash-es';
import React, { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import BackButton from '@/core/ui/actions/BackButton';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import Loading from '@/core/ui/loading/Loading';
import { BlockSectionTitle, Caption } from '@/core/ui/typography';
import SpaceCardTagline from '@/domain/space/components/cards/components/SpaceCardTagline';
import SpaceCardBase from '@/domain/space/components/cards/SpaceCardBase';
import InvitationCardHorizontal from '../invitations/InvitationCardHorizontal/InvitationCardHorizontal';
import InvitationDialog from '../invitations/InvitationDialog';
import useInvitationActions from '../invitations/useInvitationActions';
import type { PendingApplicationItem } from '../user/models/PendingApplicationItem';
import type { PendingInvitationItem } from '../user/models/PendingInvitationItem';
import {
  type InvitationWithMeta,
  useApplicationHydrator,
  useInvitationHydrator,
  usePendingMemberships,
} from './PendingMemberships';
import { PendingMembershipsDialogType, usePendingMembershipsDialog } from './PendingMembershipsDialogContext';

interface SectionProps<T> {
  title: string;
  items: T[] | undefined;
  children: (item: T) => ReactNode;
}

const Section = <T extends { id: string }>({ title, items, children }: SectionProps<T>) => {
  if (!items?.length) {
    return null;
  }

  return (
    <>
      <BlockSectionTitle>{title}</BlockSectionTitle>
      {items.map(item => (
        <React.Fragment key={item.id}>{children(item)}</React.Fragment>
      ))}
    </>
  );
};

const HydratedInvitationCard = ({
  invitation,
  onClick,
}: {
  invitation: PendingInvitationItem;
  onClick: (inv: InvitationWithMeta) => void;
}) => {
  const { invitation: hydrated } = useInvitationHydrator(invitation);
  return <InvitationCardHorizontal invitation={hydrated} onClick={() => hydrated && onClick(hydrated)} />;
};

const HydratedApplicationCard = ({
  application,
  onClick,
}: {
  application: PendingApplicationItem;
  onClick: (url: string) => void;
}) => {
  const { application: hydrated } = useApplicationHydrator(application);
  if (!hydrated) return null;
  return (
    <SpaceCardBase
      header={hydrated.space.about.profile.displayName}
      tags={hydrated.space.about.profile.tagset?.tags ?? []}
      banner={hydrated.space.about.profile.cardBanner}
      spaceUri={hydrated.space.about.profile.url}
      onClick={() => onClick(hydrated.space.about.profile.url)}
    >
      <SpaceCardTagline>{hydrated.space.about.profile.tagline ?? ''}</SpaceCardTagline>
    </SpaceCardBase>
  );
};

const InvitationDialogWithActions = ({
  onAccept,
  onReject,
  currentInvitation,
  openDialog,
  closeDialog,
  setOpenDialog,
}: {
  onAccept: () => void;
  onReject: () => void;
  currentInvitation: PendingInvitationItem | undefined;
  openDialog: ReturnType<typeof usePendingMembershipsDialog>['openDialog'];
  closeDialog: () => void;
  setOpenDialog: ReturnType<typeof usePendingMembershipsDialog>['setOpenDialog'];
}) => {
  const props = useInvitationActions({
    onAccept,
    onReject,
    spaceId: currentInvitation?.spacePendingMembershipInfo.id,
  });

  return (
    <InvitationDialog
      open={openDialog?.type === PendingMembershipsDialogType.InvitationView}
      onClose={closeDialog}
      invitation={currentInvitation}
      actions={
        <BackButton onClick={() => setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList })} />
      }
      {...props}
    />
  );
};

const PendingMembershipsDialog = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { openDialog, setOpenDialog } = usePendingMembershipsDialog();

  const closeDialog = () => setOpenDialog(undefined);

  const handleInvitationCardClick = ({ id, space, invitation }: InvitationWithMeta) => {
    setOpenDialog({
      type: PendingMembershipsDialogType.InvitationView,
      invitationId: id,
      spaceUri: invitation.actor?.type === ActorType.VirtualContributor ? undefined : space.about.profile.url,
    });
  };

  const isDialogOpen = Object.values(PendingMembershipsDialogType).includes(openDialog?.type ?? '');
  const isPendingMembershipsList = openDialog?.type === PendingMembershipsDialogType.PendingMembershipsList;

  // skip if the dialog is not open
  const { invitations, applications, loading, refetch } = usePendingMemberships({
    skip: !isDialogOpen,
  });

  useEffect(() => {
    if (isPendingMembershipsList) {
      refetch();
    }
  }, [isPendingMembershipsList, refetch]);

  const currentInvitation =
    openDialog?.type === PendingMembershipsDialogType.InvitationView
      ? invitations?.find(invitation => invitation.id === openDialog.invitationId)
      : undefined;

  const virtualContributorInvitations = invitations?.filter(
    invitation => invitation.invitation.actor?.type === ActorType.VirtualContributor
  );

  const nonVirtualContributorInvitations = invitations?.filter(
    invitation => invitation.invitation.actor?.type !== ActorType.VirtualContributor
  );

  const isEmpty =
    !nonVirtualContributorInvitations?.length && !virtualContributorInvitations?.length && !applications?.length;

  const handleSpaceCardClick = (spaceUrl: string) => {
    closeDialog();
    navigate(spaceUrl);
  };

  const onInvitationAccept = () => {
    if (openDialog?.spaceUri) {
      navigate(openDialog?.spaceUri);
      defer(closeDialog); // Deferring for appearance purpose only
    } else {
      setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList });
    }
  };

  const onInvitationReject = () => {
    setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList });
  };

  return (
    <>
      <DialogWithGrid
        columns={12}
        open={isPendingMembershipsList}
        onClose={closeDialog}
        aria-labelledby="pending-memberships-dialog"
      >
        <DialogHeader
          id="pending-memberships-dialog"
          title={
            <Gutters row={true} disablePadding={true}>
              <HdrStrongOutlined fontSize="small" />
              {t('community.pendingMembership.pendingMemberships')}
            </Gutters>
          }
          onClose={closeDialog}
        />
        <Gutters paddingTop={0}>
          {loading && <Loading />}
          {!loading && isEmpty && <Caption>{t('community.pendingMembership.empty')}</Caption>}
          {!loading && (
            <>
              <Section
                title={t('community.pendingMembership.invitationsSectionTitle')}
                items={nonVirtualContributorInvitations}
              >
                {invitation => <HydratedInvitationCard invitation={invitation} onClick={handleInvitationCardClick} />}
              </Section>
              <Section
                title={t('community.pendingMembership.virtualInvitationsSectionTitle')}
                items={virtualContributorInvitations}
              >
                {invitation => <HydratedInvitationCard invitation={invitation} onClick={handleInvitationCardClick} />}
              </Section>
              {applications?.length ? (
                <>
                  <BlockSectionTitle>{t('community.pendingMembership.applicationsSectionTitle')}</BlockSectionTitle>
                  <ScrollableCardsLayoutContainer>
                    {applications.map(application => (
                      <HydratedApplicationCard
                        key={application.id}
                        application={application}
                        onClick={handleSpaceCardClick}
                      />
                    ))}
                  </ScrollableCardsLayoutContainer>
                </>
              ) : null}
            </>
          )}
        </Gutters>
      </DialogWithGrid>
      <InvitationDialogWithActions
        onAccept={onInvitationAccept}
        onReject={onInvitationReject}
        currentInvitation={currentInvitation}
        openDialog={openDialog}
        closeDialog={closeDialog}
        setOpenDialog={setOpenDialog}
      />
    </>
  );
};

export default PendingMembershipsDialog;
