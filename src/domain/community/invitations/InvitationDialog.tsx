import { CheckOutlined, HdrStrongOutlined } from '@mui/icons-material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useScreenSize } from '@/core/ui/grid/constants';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle, Caption, Text } from '@/core/ui/typography';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import DetailedActivityDescription from '@/domain/shared/components/ActivityDescription/DetailedActivityDescription';
import References from '@/domain/shared/components/References/References';
import SpaceCardTagline from '@/domain/space/components/cards/components/SpaceCardTagline';
import SpaceCardBase from '@/domain/space/components/cards/SpaceCardBase';
import { type InvitationWithMeta, useInvitationHydrator } from '../pendingMembership/PendingMemberships';
import type { PendingInvitationItem } from '../user/models/PendingInvitationItem';

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
  const { invitation: hydrated, communityGuidelines } = useInvitationHydrator(invitation, {
    withCommunityGuidelines: true,
  });

  const { isSmallScreen } = useScreenSize();

  const getTitle = (invitation: InvitationWithMeta) => {
    if (invitation.invitation.actor?.type === ActorType.VirtualContributor) {
      return t('community.pendingMembership.invitationDialog.vc.title', {
        space: invitation?.space.about.profile.displayName,
      });
    }

    return t('community.pendingMembership.invitationDialog.title', {
      space: invitation?.space.about.profile.displayName,
    });
  };

  const getAcceptLabel = (invitation: InvitationWithMeta) => {
    if (invitation.invitation.actor?.type === ActorType.VirtualContributor) {
      return t('community.pendingMembership.invitationDialog.actions.accept');
    }

    return t('community.pendingMembership.invitationDialog.actions.join');
  };

  const onCardClick = (url: string) => {
    if (url) {
      navigate(url);
      onClose();
    }
  };

  return (
    <DialogWithGrid
      columns={12}
      open={open}
      onClose={onClose}
      aria-labelledby={hydrated ? 'invitation-dialog' : undefined}
    >
      {hydrated && (
        <>
          <DialogHeader
            id="invitation-dialog"
            title={
              <Gutters row={true} disablePadding={true} sx={{ whiteSpace: 'break-spaces' }}>
                <HdrStrongOutlined fontSize="small" />
                {getTitle(hydrated)}
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
                header={hydrated.space.about.profile.displayName}
                tags={hydrated.space.about.profile.tagset?.tags ?? []}
                banner={hydrated.space.about.profile.cardBanner}
                spaceId={hydrated.space.id}
                spaceUri={hydrated.space.about.profile.url}
                onClick={() => onCardClick(hydrated.space.about.profile.url)}
              >
                <SpaceCardTagline>{hydrated.space.about.profile.tagline ?? ''}</SpaceCardTagline>
              </SpaceCardBase>
              <Gutters disablePadding={true}>
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
                {hydrated.invitation.welcomeMessage && <Text>{hydrated.invitation.welcomeMessage}</Text>}
                {communityGuidelines && (
                  <>
                    <BlockSectionTitle paddingTop={gutters()}>
                      {communityGuidelines.profile.displayName}
                    </BlockSectionTitle>
                    <Gutters disablePadding={true}>
                      <Box sx={{ wordWrap: 'break-word' }}>
                        <WrapperMarkdown disableParagraphPadding={true}>
                          {communityGuidelines?.profile.description ?? ''}
                        </WrapperMarkdown>
                      </Box>
                      <References compact={true} references={communityGuidelines?.profile.references} />
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
              onClick={() => rejectInvitation(hydrated.invitation.id)}
              variant="outlined"
              loading={rejecting}
              disabled={updating && !rejecting}
            >
              {t('community.pendingMembership.invitationDialog.actions.reject')}
            </Button>
            <Button
              startIcon={<CheckOutlined />}
              onClick={() => acceptInvitation(hydrated.invitation.id, hydrated.space.about.profile.url)}
              variant="contained"
              loading={accepting}
              disabled={updating && !accepting}
            >
              {getAcceptLabel(hydrated)}
            </Button>
          </DialogActions>
        </>
      )}
    </DialogWithGrid>
  );
};

export default InvitationDialog;
