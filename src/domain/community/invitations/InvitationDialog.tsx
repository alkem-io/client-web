import React, { ReactNode } from 'react';
import {
  getChildJourneyTypeName,
  InvitationHydrator,
  InvitationWithMeta,
} from '../pendingMembership/PendingMemberships';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import Gutters from '../../../core/ui/grid/Gutters';
import { CheckOutlined, HdrStrongOutlined } from '@mui/icons-material';
import JourneyCard from '../../journey/common/JourneyCard/JourneyCard';
import journeyIcon from '../../shared/components/JourneyIcon/JourneyIcon';
import JourneyCardTagline from '../../journey/common/JourneyCard/JourneyCardTagline';
import { BlockSectionTitle, Caption, Text } from '../../../core/ui/typography';
import DetailedActivityDescription from '../../shared/components/ActivityDescription/DetailedActivityDescription';
import { LoadingButton } from '@mui/lab';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import { InvitationItem } from '../user/providers/UserProvider/InvitationItem';
import { useTranslation } from 'react-i18next';
import { CommunityContributorType, VisualType } from '../../../core/apollo/generated/graphql-schema';
import { Box, DialogActions, DialogContent, useMediaQuery } from '@mui/material';
import WrapperMarkdown from '../../../core/ui/markdown/WrapperMarkdown';
import References from '../../shared/components/References/References';
import { gutters } from '../../../core/ui/grid/utils';
import FlexSpacer from '../../../core/ui/utils/FlexSpacer';
import { theme } from '../../../core/ui/themes/default/Theme';

interface InvitationDialogProps {
  open: boolean;
  onClose: () => void;
  invitation: InvitationItem | undefined;
  updating: boolean;
  acceptInvitation: (invitationId: string) => void;
  accepting: boolean;
  rejectInvitation: (invitationId: string) => void;
  rejecting: boolean;
  actions?: ReactNode;
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
  actions,
}: InvitationDialogProps) => {
  const { t } = useTranslation();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getTitle = (invitation: InvitationWithMeta) => {
    if (invitation.invitation.contributorType === CommunityContributorType.Virtual) {
      return t('community.pendingMembership.invitationDialog.vc.title', {
        journey: invitation?.space.profile.displayName,
      });
    }

    return t('community.pendingMembership.invitationDialog.title', {
      journey: invitation?.space.profile.displayName,
    });
  };

  const getAcceptLabel = (invitation: InvitationWithMeta) => {
    if (invitation.invitation.contributorType === CommunityContributorType.Virtual) {
      return t('community.pendingMembership.invitationDialog.actions.accept');
    }

    return t('community.pendingMembership.invitationDialog.actions.join');
  };

  return (
    <DialogWithGrid columns={12} open={open} onClose={onClose}>
      {invitation && (
        <InvitationHydrator
          invitation={invitation}
          withJourneyDetails
          withCommunityGuidelines
          visualType={VisualType.Card}
        >
          {({ invitation, communityGuidelines }) =>
            invitation && (
              <>
                <DialogHeader
                  title={
                    <Gutters row disablePadding sx={{ whiteSpace: 'break-spaces' }}>
                      <HdrStrongOutlined fontSize="small" />
                      {getTitle(invitation)}
                    </Gutters>
                  }
                  onClose={onClose}
                />
                <DialogContent sx={{ padding: 0 }}>
                  <Gutters
                    paddingTop={0}
                    flexDirection={isMobile ? 'column' : 'row'}
                    alignItems={isMobile ? 'center' : 'start'}
                  >
                    <JourneyCard
                      iconComponent={journeyIcon[getChildJourneyTypeName(invitation.space)]}
                      header={invitation.space.profile.displayName}
                      tags={invitation.space.profile.tagset?.tags ?? []}
                      banner={invitation.space.profile.visual}
                      journeyUri={invitation.space.profile.url}
                    >
                      <JourneyCardTagline>{invitation.space.profile.tagline}</JourneyCardTagline>
                    </JourneyCard>
                    <Gutters disablePadding>
                      <Caption>
                        <DetailedActivityDescription
                          i18nKey="community.pendingMembership.invitationTitle"
                          journeyDisplayName={invitation.space.profile.displayName}
                          journeyUrl={invitation.space.profile.url}
                          journeyTypeName={getChildJourneyTypeName(invitation.space)}
                          createdDate={invitation.invitation.createdDate}
                          author={{ displayName: invitation.userDisplayName }}
                          type={invitation.invitation.contributorType}
                        />
                      </Caption>
                      {invitation.invitation.welcomeMessage && <Text>{invitation.invitation.welcomeMessage}</Text>}
                      {communityGuidelines && (
                        <>
                          <BlockSectionTitle paddingTop={gutters()}>
                            {communityGuidelines.profile.displayName}
                          </BlockSectionTitle>
                          <Gutters disablePadding>
                            <Box sx={{ wordWrap: 'break-word' }}>
                              <WrapperMarkdown disableParagraphPadding>
                                {communityGuidelines?.profile.description ?? ''}
                              </WrapperMarkdown>
                            </Box>
                            <References compact references={communityGuidelines?.profile.references} />
                          </Gutters>
                        </>
                      )}
                    </Gutters>
                  </Gutters>
                </DialogContent>
                <DialogActions>
                  {actions}
                  <FlexSpacer />
                  <LoadingButton
                    startIcon={<CloseOutlinedIcon />}
                    onClick={() => rejectInvitation(invitation.invitation.id)}
                    variant="outlined"
                    loading={rejecting}
                    disabled={updating && !rejecting}
                  >
                    {t('community.pendingMembership.invitationDialog.actions.reject')}
                  </LoadingButton>
                  <LoadingButton
                    startIcon={<CheckOutlined />}
                    onClick={() => acceptInvitation(invitation.invitation.id)}
                    variant="contained"
                    loading={accepting}
                    disabled={updating && !accepting}
                  >
                    {getAcceptLabel(invitation)}
                  </LoadingButton>
                </DialogActions>
              </>
            )
          }
        </InvitationHydrator>
      )}
    </DialogWithGrid>
  );
};

export default InvitationDialog;
