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
import ScrollableCardsLayoutContainer from '../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import JourneyCardTagline from '../../journey/common/JourneyCard/JourneyCardTagline';
import InvitationDialog from '../invitations/InvitationDialog';
import InvitationActionsContainer from '../invitations/InvitationActionsContainer';
import { VisualType } from '../../../core/apollo/generated/graphql-schema';

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
      <InvitationActionsContainer onUpdate={() => setOpenDialog({ type: DialogType.PendingMembershipsList })}>
        {props => (
          <InvitationDialog
            open={openDialog?.type === DialogType.InvitationView}
            onClose={() => setOpenDialog({ type: DialogType.PendingMembershipsList })}
            invitation={currentInvitation}
            {...props}
          />
        )}
      </InvitationActionsContainer>
    </>
  );
};

export default PendingMembershipsUserMenuItem;
