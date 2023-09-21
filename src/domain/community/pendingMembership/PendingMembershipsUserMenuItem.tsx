import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import { HdrStrongOutlined } from '@mui/icons-material';
import Gutters from '../../../core/ui/grid/Gutters';
import { BlockSectionTitle } from '../../../core/ui/typography';
import { ApplicationHydrator, InvitationHydrator, usePendingMemberships } from './PendingMemberships';
import InvitationCardHorizontal from '../invitations/InvitationCardHorizontal/InvitationCardHorizontal';
import JourneyCard from '../../journey/common/JourneyCard/JourneyCard';
import journeyIcon from '../../shared/components/JourneyIcon/JourneyIcon';
import { Identifiable } from '../../../core/utils/Identifiable';
import { refetchUserProviderQuery, useInvitationStateEventMutation } from '../../../core/apollo/generated/apollo-hooks';
import useLoadingState from '../../shared/utils/useLoadingState';
import ScrollableCardsLayoutContainer from '../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import JourneyCardTagline from '../../journey/common/JourneyCard/JourneyCardTagline';
import InvitationDialog from './InvitationDialog';

interface ButtonImplementationParams {
  header: ReactNode;
  openDialog: () => void;
}

interface PendingMembershipsUserMenuItemProps {
  children: ({ header, openDialog }: ButtonImplementationParams) => ReactNode;
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

const PendingMembershipsUserMenuItem = ({ children }: PendingMembershipsUserMenuItemProps) => {
  const { t } = useTranslation();

  const [openDialog, setOpenDialog] = useState<PendingMembershipsListDialogDetails | InvitationViewDialogDetails>();

  const closeDialog = () => setOpenDialog(undefined);

  const handleInvitationCardClick = ({ id }: Identifiable) => {
    setOpenDialog({
      type: DialogType.InvitationView,
      invitationId: id,
    });
  };

  const { invitations, applications } = usePendingMemberships();

  const currentInvitation =
    openDialog?.type === DialogType.InvitationView
      ? invitations?.find(invitation => invitation.id === openDialog.invitationId)
      : undefined;

  const [invitationStateEventMutation] = useInvitationStateEventMutation({
    refetchQueries: [refetchUserProviderQuery()],
  });

  const [changeInvitationState, isChangingInvitationState] = useLoadingState(
    async (...args: Parameters<typeof invitationStateEventMutation>) => {
      await invitationStateEventMutation(...args);
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

  const [rejectInvitation, isRejecting] = useLoadingState((invitationId: string) =>
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
      {children({
        header: t('community.pendingMembership.pendingMembershipsWithCount', { count: pendingMembershipsCount }),
        openDialog: () => setOpenDialog({ type: DialogType.PendingMembershipsList }),
      })}
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
              <ScrollableCardsLayoutContainer>
                {applications?.map(application => (
                  <ApplicationHydrator key={application.id} application={application}>
                    {({ application: hydratedApplication }) =>
                      hydratedApplication && (
                        <JourneyCard
                          iconComponent={journeyIcon[hydratedApplication.journeyTypeName]}
                          header={hydratedApplication.journeyDisplayName}
                          tags={hydratedApplication.journeyTags ?? []}
                          banner={hydratedApplication.journeyCardBanner}
                          journeyUri={hydratedApplication.journeyUri}
                        >
                          <JourneyCardTagline>{hydratedApplication.journeyTagline ?? ''}</JourneyCardTagline>
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
      <InvitationDialog
        open={openDialog?.type === DialogType.InvitationView}
        onClose={() => setOpenDialog({ type: DialogType.PendingMembershipsList })}
        invitation={currentInvitation}
        updating={isChangingInvitationState}
        acceptInvitation={acceptInvitation}
        accepting={isAccepting}
        rejectInvitation={rejectInvitation}
        rejecting={isRejecting}
      />
    </>
  );
};

export default PendingMembershipsUserMenuItem;
