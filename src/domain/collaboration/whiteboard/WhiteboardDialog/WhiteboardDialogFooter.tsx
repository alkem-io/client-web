import { MouseEventHandler, useState } from 'react';
import { gutters } from '@/core/ui/grid/utils';
import { Box, Button, DialogContent } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { DeleteOutline } from '@mui/icons-material';
import { Actions } from '@/core/ui/actions/Actions';
import { Trans, useTranslation } from 'react-i18next';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { CommunityMembershipStatus, ContentUpdatePolicy, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import RouterLink from '@/core/ui/link/RouterLink';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { Identifiable } from '@/core/utils/Identifiable';
import { Visual } from '@/domain/common/visual/Visual';
import {
  CollaboratorMode,
  CollaboratorModeReasons,
} from '@/domain/common/whiteboard/excalidraw/collab/excalidrawAppConstants';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import GuestVisibilityBadge from '../components/GuestVisibilityBadge';

interface WhiteboardDialogFooterProps {
  whiteboardUrl: string | undefined;
  lastSaveError: string | undefined;
  canUpdateContent: boolean;
  onDelete: () => void;
  canDelete?: boolean;
  onRestart?: () => void;
  updating?: boolean;
  createdBy:
    | (Identifiable & {
        profile: {
          displayName: string;
          url: string;
          avatar?: Visual;
        };
      })
    | undefined;
  contentUpdatePolicy: ContentUpdatePolicy | undefined;
  collaboratorMode: CollaboratorMode | null;
  collaboratorModeReason: CollaboratorModeReasons | null;
  guestAccessEnabled?: boolean;
}

enum ReadonlyReason {
  Readonly = 'readonly',
  ContentUpdatePolicy = 'contentUpdatePolicy',
  NoMembership = 'noMembership',
  Unauthenticated = 'unauthenticated',
}

const WhiteboardDialogFooter = ({
  whiteboardUrl,
  canUpdateContent,
  onDelete,
  canDelete,
  onRestart,
  contentUpdatePolicy,
  createdBy,
  collaboratorMode,
  collaboratorModeReason,
  updating = false,
  guestAccessEnabled = false,
}: WhiteboardDialogFooterProps) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthenticationContext();

  // TODO: WhiteboardDialogFooter depends on being inside a Space, not sure if this is fully correct
  const { spaceLevel = SpaceLevel.L0 } = useUrlResolver();
  const { space } = useSpace();
  const { subspace } = useSubSpace();
  const spaceAbout = space.about;
  const subspaceAbout = subspace.about;

  const getMyMembershipStatus = () => {
    switch (spaceLevel) {
      case SpaceLevel.L0:
        return spaceAbout.membership?.myMembershipStatus;
      default:
        return subspaceAbout.membership?.myMembershipStatus;
    }
  };

  const getSpaceAboutProfile = () => {
    switch (spaceLevel) {
      case SpaceLevel.L0:
        return spaceAbout.profile;
      case SpaceLevel.L1:
        return subspaceAbout.profile;
    }
  };

  const spaceAboutProfile = getSpaceAboutProfile();

  const getReadonlyReason = () => {
    if (canUpdateContent) {
      return collaboratorMode === 'read' ? ReadonlyReason.Readonly : null;
    }
    if (!isAuthenticated) {
      return ReadonlyReason.Unauthenticated;
    }
    if (
      contentUpdatePolicy === ContentUpdatePolicy.Contributors &&
      getMyMembershipStatus() !== CommunityMembershipStatus.Member
    ) {
      return ReadonlyReason.NoMembership;
    }
    return ReadonlyReason.ContentUpdatePolicy;
  };

  const readonlyReason = getReadonlyReason();

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const handleAuthorClick: MouseEventHandler = event => {
    event.preventDefault();
    sendMessage('user', {
      id: createdBy?.id ?? '',
      displayName: createdBy?.profile.displayName,
      avatarUri: createdBy?.profile.avatar?.uri,
    });
  };

  const [isLearnWhyDialogOpen, setIsLearnWhyDialogOpen] = useState(false);

  const handleLearnWhyClick: MouseEventHandler = event => {
    event.preventDefault();
    setIsLearnWhyDialogOpen(true);
  };

  const canRestart =
    readonlyReason === ReadonlyReason.Readonly &&
    (!collaboratorModeReason ||
      collaboratorModeReason === CollaboratorModeReasons.INACTIVITY ||
      collaboratorModeReason === CollaboratorModeReasons.ROOM_CAPACITY_REACHED);

  return (
    <>
      <Actions
        paddingX={gutters()}
        paddingY={gutters(0.5)}
        gap={gutters(0.5)}
        justifyContent="start"
        alignItems="center"
        flexWrap="wrap"
      >
        {canDelete && (
          <Button
            color="error"
            startIcon={<DeleteOutline />}
            onClick={onDelete}
            disabled={!canUpdateContent || updating}
            sx={{ textTransform: 'none' }}
            aria-label={t('buttons.delete')}
          >
            <Caption>{t('buttons.delete')}</Caption>
          </Button>
        )}
        {readonlyReason && (
          <Caption>
            <Trans
              i18nKey={`pages.whiteboard.readonlyReason.${readonlyReason}` as const}
              values={{
                spaceLevel: t(`common.space-level.${spaceLevel}`),
                ownerName: createdBy?.profile.displayName,
              }}
              components={{
                ownerlink: createdBy ? (
                  <RouterLink to={createdBy.profile.url} underline="always" onClick={handleAuthorClick} />
                ) : (
                  <span />
                ),
                spacelink: spaceAboutProfile ? (
                  <RouterLink to={spaceAboutProfile.url} underline="always" reloadDocument />
                ) : (
                  <span />
                ),
                signinlink: <RouterLink to={buildLoginUrl(whiteboardUrl)} state={{}} underline="always" />,
                learnwhy: <RouterLink to="" underline="always" onClick={handleLearnWhyClick} />,
              }}
            />
          </Caption>
        )}
        {canRestart && (
          <Button onClick={onRestart} variant="outlined" sx={{ textTransform: 'none' }} size="small">
            {t('pages.whiteboard.restartCollaboration')}
          </Button>
        )}

        {guestAccessEnabled && (
          <Box marginLeft="auto">
            <GuestVisibilityBadge size="compact" data-testid="guest-visibility-badge-footer" />
          </Box>
        )}

        {directMessageDialog}
      </Actions>
      <DialogWithGrid
        open={isLearnWhyDialogOpen}
        onClose={() => setIsLearnWhyDialogOpen(false)}
        aria-labelledby="whiteboard-dialog-footer"
      >
        <DialogHeader
          id="whiteboard-dialog-footer"
          title={t('pages.whiteboard.readonlyDialog.title')}
          onClose={() => setIsLearnWhyDialogOpen(false)}
        />
        <DialogContent sx={{ paddingTop: 0 }}>
          <WrapperMarkdown>
            {t(`pages.whiteboard.readonlyDialog.reason.${collaboratorModeReason ?? 'generic'}` as const)}
          </WrapperMarkdown>
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default WhiteboardDialogFooter;
