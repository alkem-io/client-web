import React from 'react';
import { InvitationHydrator } from '../pendingMembership/PendingMemberships';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import Gutters from '../../../core/ui/grid/Gutters';
import { CheckOutlined, HdrStrongOutlined } from '@mui/icons-material';
import JourneyCard from '../../journey/common/JourneyCard/JourneyCard';
import journeyIcon from '../../shared/components/JourneyIcon/JourneyIcon';
import JourneyCardTagline from '../../journey/common/JourneyCard/JourneyCardTagline';
import { Caption, Text } from '../../../core/ui/typography';
import ActivityDescription from '../../shared/components/ActivityDescription/ActivityDescription';
import { Actions } from '../../../core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import { InvitationItem } from '../user/providers/UserProvider/InvitationItem';
import { useTranslation } from 'react-i18next';

interface InvitationDialogProps {
  open: boolean;
  onClose: () => void;
  invitation: InvitationItem | undefined;
  updating: boolean;
  acceptInvitation: (invitationId: string) => void;
  accepting: boolean;
  rejectInvitation: (invitationId: string) => void;
  rejecting: boolean;
}

const InvitationDialog = ({
  invitation,
  updating,
  acceptInvitation,
  accepting,
  rejectInvitation,
  rejecting,
  open,
  onClose,
}: InvitationDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid columns={12} open={open} onClose={onClose}>
      {invitation && (
        <InvitationHydrator invitation={invitation} withJourneyDetails>
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
                  onClose={onClose}
                />
                <Gutters paddingTop={0} row>
                  <JourneyCard
                    iconComponent={journeyIcon[invitation.journeyTypeName]}
                    header={invitation.journeyDisplayName}
                    tags={invitation.journeyTags ?? []}
                    banner={invitation.journeyCardBanner}
                    journeyUri={invitation.journeyUri}
                  >
                    <JourneyCardTagline>{invitation.journeyTagline ?? ''}</JourneyCardTagline>
                  </JourneyCard>
                  <Gutters disablePadding>
                    <Caption>
                      <ActivityDescription
                        i18nKey="community.pendingMembership.invitationTitle"
                        {...invitation}
                        author={{ displayName: invitation.userDisplayName }}
                      />
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
                      onClick={() => rejectInvitation(invitation.id)}
                      variant="outlined"
                      loading={rejecting}
                      disabled={updating && !rejecting}
                    >
                      {t('community.pendingMembership.invitationDialog.actions.reject')}
                    </LoadingButton>
                    <LoadingButton
                      startIcon={<CheckOutlined />}
                      onClick={() => acceptInvitation(invitation.id)}
                      variant="contained"
                      loading={accepting}
                      disabled={updating && !accepting}
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
  );
};

export default InvitationDialog;
