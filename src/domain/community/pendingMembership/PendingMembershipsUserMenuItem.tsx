import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import { CheckOutlined, HdrStrongOutlined } from '@mui/icons-material';
import Gutters from '../../../core/ui/grid/Gutters';
import { BlockSectionTitle, Caption, Text } from '../../../core/ui/typography';
import { ApplicationHydrator, InvitationHydrator, usePendingMemberships } from './PendingMemberships';
import InvitationCardHorizontal from '../invitations/InvitationCardHorizontal/InvitationCardHorizontal';
import JourneyCard from '../../challenge/common/JourneyCard/JourneyCard';
import journeyIcon from '../../shared/components/JourneyIcon/JourneyIcon';
import ActivityDescription from '../../shared/components/ActivityDescription/ActivityDescription';
import { Actions } from '../../../core/ui/actions/Actions';
import { Identifiable } from '../../shared/types/Identifiable';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useInvitationStateEventMutation } from '../../../core/apollo/generated/apollo-hooks';
import { LoadingButton } from '@mui/lab';
import useLoadingState from '../../shared/utils/useLoadingState';
import { buildJourneyUrl } from '../../../common/utils/urlBuilders';

interface PendingMembershipsUserMenuItemProps {
  onClick?: (e: React.MouseEvent) => void;
}

enum DialogType {
  PendingMembershipsList,
  InvitationView,
}

interface DialogDetails {
  type: DialogType;
}

interface PendingMembershipsListDialogDetails extends DialogDetails {
  type: DialogType.PendingMembershipsList;
}

interface InvitationViewDialogDetails extends DialogDetails {
  type: DialogType.InvitationView;
  invitationId: string;
}

const PendingMembershipsUserMenuItem = ({ onClick }: PendingMembershipsUserMenuItemProps) => {
  const { t } = useTranslation();

  const [openDialog, setOpenDialog] = useState<PendingMembershipsListDialogDetails | InvitationViewDialogDetails>();

  const closeDialog = () => setOpenDialog(undefined);

  const handleInvitationCardClick = ({ id }: Identifiable) => {
    setOpenDialog({
      type: DialogType.InvitationView,
      invitationId: id,
    });
  };

  const { invitations, applications, refetchPendingMemberships } = usePendingMemberships();

  const currentInvitation =
    openDialog?.type === DialogType.InvitationView
      ? invitations?.find(invitation => invitation.id === openDialog.invitationId)
      : undefined;

  const [invitationStateEventMutation] = useInvitationStateEventMutation();

  const [changeInvitationState, isChangingInvitationState] = useLoadingState(
    async (...args: Parameters<typeof invitationStateEventMutation>) => {
      await invitationStateEventMutation(...args);
      await refetchPendingMemberships();
      setOpenDialog({ type: DialogType.PendingMembershipsList });
    }
  );

  const [acceptInvitation, isAccepting] = useLoadingState((invitationId: string) =>
    changeInvitationState({
      variables: {
        invitationId,
        eventName: 'ACCEPT',
      },
    })
  );

  const [rejectInvitation, isDeclining] = useLoadingState((invitationId: string) =>
    changeInvitationState({
      variables: {
        invitationId,
        eventName: 'REJECT',
      },
    })
  );

  // TODO Uncomment when hiding an Invitation is available in the API
  // const [hideInvitation, isHiding] = useLoadingState((invitationId: string) =>
  //   deleteInvitation({
  //     variables: {
  //       invitationId,
  //     },
  //   })
  // );

  const pendingMembershipsCount = invitations && applications ? invitations.length + applications.length : undefined;

  return (
    <>
      <ListItemButton
        onClick={event => {
          setOpenDialog({ type: DialogType.PendingMembershipsList });
          onClick?.(event);
        }}
      >
        <ListItemIcon>
          <HdrStrongOutlined />
        </ListItemIcon>
        <ListItemText
          primary={t('community.pendingMembership.pendingMembershipsWithCount', { count: pendingMembershipsCount })}
        />
      </ListItemButton>
      <DialogWithGrid columns={12} open={openDialog?.type === DialogType.PendingMembershipsList} onClose={closeDialog}>
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
          {invitations && invitations.length > 0 && (
            <>
              <BlockSectionTitle>{t('community.pendingMembership.invitationsSectionTitle')}</BlockSectionTitle>
              {invitations?.map(invitation => (
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
              {applications?.map(application => (
                <ApplicationHydrator key={application.id} application={application}>
                  {({ application: hydratedApplication }) =>
                    hydratedApplication && (
                      <JourneyCard
                        iconComponent={journeyIcon[hydratedApplication.journeyTypeName]}
                        header={hydratedApplication.journeyDisplayName}
                        tagline={hydratedApplication.journeyDescription ?? ''}
                        tags={hydratedApplication.journeyTags ?? []}
                        journeyUri={
                          buildJourneyUrl({
                            spaceNameId: application.spaceID,
                            challengeNameId: application.challengeID,
                            opportunityNameId: application.opportunityID,
                          }) ?? ''
                        }
                      />
                    )
                  }
                </ApplicationHydrator>
              ))}
            </>
          )}
        </Gutters>
      </DialogWithGrid>
      <DialogWithGrid
        columns={12}
        open={openDialog?.type === DialogType.InvitationView}
        onClose={() => setOpenDialog({ type: DialogType.PendingMembershipsList })}
      >
        {currentInvitation && (
          <InvitationHydrator invitation={currentInvitation} withJourneyDetails>
            {({ invitation }) =>
              invitation && (
                <>
                  <DialogHeader
                    title={
                      <Gutters row disablePadding>
                        <HdrStrongOutlined fontSize="small" />
                        {t('community.pendingMembership.invitationDialog.title', {
                          journey: invitation?.journeyDisplayName,
                        })}
                      </Gutters>
                    }
                    onClose={() => setOpenDialog({ type: DialogType.PendingMembershipsList })}
                  />
                  <Gutters paddingTop={0} row>
                    <JourneyCard
                      iconComponent={journeyIcon[invitation.journeyTypeName]}
                      header={invitation.journeyDisplayName}
                      tagline={invitation.journeyDescription ?? ''}
                      tags={invitation.journeyTags ?? []}
                      journeyUri={
                        buildJourneyUrl({
                          spaceNameId: currentInvitation.spaceID,
                          challengeNameId: currentInvitation.challengeID,
                          opportunityNameId: currentInvitation.opportunityID,
                        }) ?? ''
                      }
                    />
                    <Gutters disablePadding>
                      <Caption>
                        <ActivityDescription i18nKey="community.pendingMembership.invitationTitle" {...invitation} />
                      </Caption>
                      {invitation.welcomeMessage && <Text>{invitation.welcomeMessage}</Text>}
                    </Gutters>
                  </Gutters>
                  <Gutters paddingTop={0}>
                    <Actions justifyContent="end">
                      {/*<LoadingButton*/}
                      {/*  startIcon={<VisibilityOffOutlined />}*/}
                      {/*  onClick={() => hideInvitation(currentInvitation.id)}*/}
                      {/*  loading={isHiding}*/}
                      {/*  disabled={isChangingInvitationState && !isHiding}*/}
                      {/*>*/}
                      {/*  {t('community.pendingMembership.invitationDialog.actions.hide')}*/}
                      {/*</LoadingButton>*/}
                      <LoadingButton
                        startIcon={<CloseOutlinedIcon />}
                        onClick={() => rejectInvitation(currentInvitation.id)}
                        variant="outlined"
                        loading={isDeclining}
                        disabled={isChangingInvitationState && !isDeclining}
                      >
                        {t('community.pendingMembership.invitationDialog.actions.reject')}
                      </LoadingButton>
                      <LoadingButton
                        startIcon={<CheckOutlined />}
                        onClick={() => acceptInvitation(currentInvitation.id)}
                        variant="contained"
                        loading={isAccepting}
                        disabled={isChangingInvitationState && !isAccepting}
                      >
                        {t('community.pendingMembership.invitationDialog.actions.accept')}
                      </LoadingButton>
                    </Actions>
                  </Gutters>
                </>
              )
            }
          </InvitationHydrator>
        )}
      </DialogWithGrid>
    </>
  );
};

export default PendingMembershipsUserMenuItem;
