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
import ScrollableCardsLayoutContainer from '../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import JourneyCardTagline from '../../journey/common/JourneyCard/JourneyCardTagline';
import InvitationDialog from '../invitations/InvitationDialog';
import InvitationActionsContainer from '../invitations/InvitationActionsContainer';
import { VisualType } from '../../../core/apollo/generated/graphql-schema';
import BackButton from '../../../core/ui/actions/BackButton';
import useNavigate from '../../../core/routing/useNavigate';
import { useNewMembershipsQuery } from '../../../core/apollo/generated/apollo-hooks';

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
  journeyUri?: string;
}

interface InvitationViewDialogDetails extends DialogDetails {
  type: DialogType.InvitationView;
  invitationId: string;
  journeyUri?: string;
}

const PendingMembershipsUserMenuItem = ({ children }: PendingMembershipsUserMenuItemProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { refetch: refetchNewMembershipsQuery } = useNewMembershipsQuery();

  const [openDialog, setOpenDialog] = useState<PendingMembershipsListDialogDetails | InvitationViewDialogDetails>();

  const closeDialog = () => setOpenDialog(undefined);

  const handleInvitationCardClick = ({ id, journeyUri }) => {
    setOpenDialog({
      type: DialogType.InvitationView,
      invitationId: id,
      journeyUri,
    });
  };

  const { invitations, applications } = usePendingMemberships();

  const currentInvitation =
    openDialog?.type === DialogType.InvitationView
      ? invitations?.find(invitation => invitation.id === openDialog.invitationId)
      : undefined;

  const pendingMembershipsCount = invitations && applications ? invitations.length + applications.length : undefined;

  const onInvitationAccept = () => {
    refetchNewMembershipsQuery();

    if (openDialog?.journeyUri) {
      navigate(openDialog?.journeyUri);
    } else {
      setOpenDialog({ type: DialogType.PendingMembershipsList });
    }
  };

  const onInvitationReject = () => {
    refetchNewMembershipsQuery();
    setOpenDialog({ type: DialogType.PendingMembershipsList });
  };

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
                  <ApplicationHydrator key={application.id} application={application} visualType={VisualType.Card}>
                    {({ application: hydratedApplication }) =>
                      hydratedApplication && (
                        <JourneyCard
                          iconComponent={journeyIcon[hydratedApplication.journeyTypeName]}
                          header={hydratedApplication.journeyDisplayName}
                          tags={hydratedApplication.journeyTags ?? []}
                          banner={hydratedApplication.journeyVisual}
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
      <InvitationActionsContainer onAccept={onInvitationAccept} onReject={onInvitationReject}>
        {props => (
          <InvitationDialog
            open={openDialog?.type === DialogType.InvitationView}
            onClose={closeDialog}
            invitation={currentInvitation}
            actions={<BackButton onClick={() => setOpenDialog({ type: DialogType.PendingMembershipsList })} />}
            {...props}
          />
        )}
      </InvitationActionsContainer>
    </>
  );
};

export default PendingMembershipsUserMenuItem;
