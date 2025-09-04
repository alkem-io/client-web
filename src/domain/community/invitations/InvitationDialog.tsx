import { ReactNode, useCallback } from 'react';
import { InvitationHydrator, InvitationWithMeta } from '../pendingMembership/PendingMemberships';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Gutters from '@/core/ui/grid/Gutters';
import { CheckOutlined, HdrStrongOutlined } from '@mui/icons-material';
import SpaceCardBase from '@/domain/space/components/cards/SpaceCardBase';
import { spaceLevelIcon } from '@/domain/space/icons/SpaceIconByLevel';
import SpaceCardTagline from '@/domain/space/components/cards/components/SpaceCardTagline';
import { BlockSectionTitle, Caption, Text } from '@/core/ui/typography';
import DetailedActivityDescription from '@/domain/shared/components/ActivityDescription/DetailedActivityDescription';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { PendingInvitationItem } from '../user/models/PendingInvitationItem';
import { useTranslation } from 'react-i18next';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import References from '@/domain/shared/components/References/References';
import { gutters } from '@/core/ui/grid/utils';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import useNavigate from '@/core/routing/useNavigate';
import { useScreenSize } from '@/core/ui/grid/constants';

type InvitationDialogProps = {
  open: boolean;
  onClose: () => void;
  invitation: PendingInvitationItem | undefined;
  updating: boolean;
  acceptInvitation: (invitationId: string, spaceUrl: string) => void;
  accepting: boolean;
  rejectInvitation: (invitationId: string) => void;
  rejecting: boolean;
  actions?: ReactNode;
};

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
  const navigate = useNavigate();

  const { isSmallScreen } = useScreenSize();

  const getTitle = (invitation: InvitationWithMeta) => {
    if (invitation.invitation.contributorType === RoleSetContributorType.Virtual) {
      return t('community.pendingMembership.invitationDialog.vc.title', {
        space: invitation?.space.about.profile.displayName,
      });
    }

    return t('community.pendingMembership.invitationDialog.title', {
      space: invitation?.space.about.profile.displayName,
    });
  };

  const getAcceptLabel = (invitation: InvitationWithMeta) => {
    if (invitation.invitation.contributorType === RoleSetContributorType.Virtual) {
      return t('community.pendingMembership.invitationDialog.actions.accept');
    }

    return t('community.pendingMembership.invitationDialog.actions.join');
  };

  const onCardClick = useCallback(
    (url: string) => {
      if (url) {
        navigate(url);
        onClose();
      }
    },
    [navigate, onClose]
  );

  return (
    <DialogWithGrid
      columns={12}
      open={open}
      onClose={onClose}
      aria-labelledby={invitation ? 'invitation-dialog' : undefined}
    >
      {invitation && (
        <InvitationHydrator invitation={invitation} withCommunityGuidelines>
          {({ invitation, communityGuidelines }) =>
            invitation && (
              <>
                <DialogHeader
                  id="invitation-dialog"
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
                    flexDirection={isSmallScreen ? 'column' : 'row'}
                    alignItems={isSmallScreen ? 'center' : 'start'}
                  >
                    <SpaceCardBase
                      iconComponent={spaceLevelIcon[invitation.space.level]}
                      header={invitation.space.about.profile.displayName}
                      tags={invitation.space.about.profile.tagset?.tags ?? []}
                      banner={invitation.space.about.profile.cardBanner}
                      spaceUri={invitation.space.about.profile.url}
                      onClick={() => onCardClick(invitation.space.about.profile.url)}
                    >
                      <SpaceCardTagline>{invitation.space.about.profile.tagline ?? ''}</SpaceCardTagline>
                    </SpaceCardBase>
                    <Gutters disablePadding>
                      <Caption>
                        <DetailedActivityDescription
                          i18nKey="community.pendingMembership.invitationTitle"
                          spaceDisplayName={invitation.space.about.profile.displayName}
                          spaceUrl={invitation.space.about.profile.url}
                          spaceLevel={invitation.space.level}
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
                  <Button
                    startIcon={<CloseOutlinedIcon />}
                    onClick={() => rejectInvitation(invitation.invitation.id)}
                    variant="outlined"
                    loading={rejecting}
                    disabled={updating && !rejecting}
                  >
                    {t('community.pendingMembership.invitationDialog.actions.reject')}
                  </Button>
                  <Button
                    startIcon={<CheckOutlined />}
                    onClick={() => acceptInvitation(invitation.invitation.id, invitation.space.about.profile.url)}
                    variant="contained"
                    loading={accepting}
                    disabled={updating && !accepting}
                  >
                    {getAcceptLabel(invitation)}
                  </Button>
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
