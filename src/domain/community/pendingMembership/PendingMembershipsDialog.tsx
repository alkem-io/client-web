import React from 'react';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { HdrStrongOutlined } from '@mui/icons-material';
import Gutters from '@/core/ui/grid/Gutters';
import { BlockSectionTitle } from '@/core/ui/typography';
import {
  ApplicationHydrator,
  InvitationHydrator,
  InvitationWithMeta,
  usePendingMemberships,
} from './PendingMemberships';
import InvitationCardHorizontal from '../invitations/InvitationCardHorizontal/InvitationCardHorizontal';
import JourneyCard from '@/domain/journey/common/JourneyCard/JourneyCard';
import { spaceLevelIcon } from '@/domain/shared/components/JourneyIcon/JourneyIcon';
import ScrollableCardsLayoutContainer from '@/core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import JourneyCardTagline from '@/domain/journey/common/JourneyCard/JourneyCardTagline';
import InvitationDialog from '../invitations/InvitationDialog';
import InvitationActionsContainer from '../invitations/InvitationActionsContainer';
import { RoleSetContributorType, VisualType } from '@/core/apollo/generated/graphql-schema';
import BackButton from '@/core/ui/actions/BackButton';
import useNavigate from '@/core/routing/useNavigate';
import { PendingMembershipsDialogType, usePendingMembershipsDialog } from './PendingMembershipsDialogContext';
import { defer } from 'lodash';

const PendingMembershipsDialog = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { openDialog, setOpenDialog } = usePendingMembershipsDialog();

  const closeDialog = () => setOpenDialog(undefined);

  const handleInvitationCardClick = ({ id, space, invitation }: InvitationWithMeta) => {
    setOpenDialog({
      type: PendingMembershipsDialogType.InvitationView,
      invitationId: id,
      journeyUri: invitation.contributorType === RoleSetContributorType.Virtual ? undefined : space.profile.url,
    });
  };

  // skip if the dialog is not open
  const { invitations, applications } = usePendingMemberships({
    skip: !Object.values(PendingMembershipsDialogType).includes(openDialog?.type ?? ''),
  });

  const currentInvitation =
    openDialog?.type === PendingMembershipsDialogType.InvitationView
      ? invitations?.find(invitation => invitation.id === openDialog.invitationId)
      : undefined;

  const virtualContributorInvitations = invitations?.filter(
    invitation => invitation.invitation.contributorType === RoleSetContributorType.Virtual
  );

  const nonVirtualContributorInvitations = invitations?.filter(
    invitation => invitation.invitation.contributorType !== RoleSetContributorType.Virtual
  );

  const onInvitationAccept = () => {
    if (openDialog?.journeyUri) {
      navigate(openDialog?.journeyUri);
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
        open={openDialog?.type === PendingMembershipsDialogType.PendingMembershipsList}
        onClose={closeDialog}
      >
        <DialogHeader
          title={
            <Gutters row disablePadding>
              <HdrStrongOutlined fontSize="small" />
              {t('community.pendingMembership.pendingMemberships')}
            </Gutters>
          }
          onClose={closeDialog}
        />
        <Gutters paddingTop={0}>
          {nonVirtualContributorInvitations && nonVirtualContributorInvitations.length > 0 && (
            <>
              <BlockSectionTitle>{t('community.pendingMembership.invitationsSectionTitle')}</BlockSectionTitle>
              {nonVirtualContributorInvitations?.map(invitation => (
                <InvitationHydrator key={invitation.id} invitation={invitation}>
                  {({ invitation }) => (
                    <InvitationCardHorizontal
                      invitation={invitation}
                      onClick={() => invitation && handleInvitationCardClick(invitation)}
                    />
                  )}
                </InvitationHydrator>
              ))}
            </>
          )}
          {virtualContributorInvitations && virtualContributorInvitations.length > 0 && (
            <>
              <BlockSectionTitle>{t('community.pendingMembership.virtualInvitationsSectionTitle')}</BlockSectionTitle>
              {virtualContributorInvitations?.map(invitation => (
                <InvitationHydrator key={invitation.id} invitation={invitation}>
                  {({ invitation }) => (
                    <InvitationCardHorizontal
                      invitation={invitation}
                      onClick={() => invitation && handleInvitationCardClick(invitation)}
                    />
                  )}
                </InvitationHydrator>
              ))}
            </>
          )}
          {applications && applications.length > 0 && (
            <>
              <BlockSectionTitle>{t('community.pendingMembership.applicationsSectionTitle')}</BlockSectionTitle>
              <ScrollableCardsLayoutContainer>
                {applications?.map(application => (
                  <ApplicationHydrator key={application.id} application={application} visualType={VisualType.Card}>
                    {({ application: hydratedApplication }) =>
                      hydratedApplication && (
                        <JourneyCard
                          iconComponent={spaceLevelIcon[hydratedApplication.space.level]}
                          header={hydratedApplication.space.profile.displayName}
                          tags={hydratedApplication.space.profile.tagset?.tags ?? []}
                          banner={hydratedApplication.space.profile.visual}
                          journeyUri={hydratedApplication.space.profile.url}
                        >
                          <JourneyCardTagline>{hydratedApplication.space.profile.tagline ?? ''}</JourneyCardTagline>
                        </JourneyCard>
                      )
                    }
                  </ApplicationHydrator>
                ))}
              </ScrollableCardsLayoutContainer>
            </>
          )}
        </Gutters>
      </DialogWithGrid>
      <InvitationActionsContainer onAccept={onInvitationAccept} onReject={onInvitationReject}>
        {props => (
          <InvitationDialog
            open={openDialog?.type === PendingMembershipsDialogType.InvitationView}
            onClose={closeDialog}
            invitation={currentInvitation}
            actions={
              <BackButton
                onClick={() => setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList })}
              />
            }
            {...props}
          />
        )}
      </InvitationActionsContainer>
    </>
  );
};

export default PendingMembershipsDialog;
