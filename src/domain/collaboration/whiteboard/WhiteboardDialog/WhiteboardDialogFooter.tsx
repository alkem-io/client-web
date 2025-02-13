import { MouseEventHandler, useEffect, useState } from 'react';
import { gutters } from '@/core/ui/grid/utils';
import { Button, DialogContent } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { DeleteOutline } from '@mui/icons-material';
import { Actions } from '@/core/ui/actions/Actions';
import { Trans, useTranslation } from 'react-i18next';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { CommunityMembershipStatus, ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import { useOpportunity } from '@/domain/journey/opportunity/hooks/useOpportunity';
import { getJourneyTypeName } from '@/domain/journey/JourneyTypeName';
import RouterLink from '@/core/ui/link/RouterLink';
import { useLocation } from 'react-router-dom';
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

interface WhiteboardDialogFooterProps {
  lastSuccessfulSavedDate: Date | undefined;
  lastSaveError: string | undefined;
  consecutiveSaveErrors: number;
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
}

enum ReadonlyReason {
  Readonly = 'readonly',
  ContentUpdatePolicy = 'contentUpdatePolicy',
  NoMembership = 'noMembership',
  Unauthenticated = 'unauthenticated',
}

const WhiteboardDialogFooter = ({
  lastSuccessfulSavedDate,
  canUpdateContent,
  onDelete,
  canDelete,
  onRestart,
  contentUpdatePolicy,
  createdBy,
  collaboratorMode,
  collaboratorModeReason,
  updating = false,
}: WhiteboardDialogFooterProps) => {
  const { t } = useTranslation();

  const { pathname } = useLocation();

  const { isAuthenticated } = useAuthenticationContext();

  const spaceContext = useSpace();
  const subspaceContext = useSubSpace();
  const subsubspaceContext = useOpportunity();

  const journeyTypeName = getJourneyTypeName({
    ...subsubspaceContext,
    ...subspaceContext,
    ...spaceContext,
  });

  const getMyMembershipStatus = () => {
    switch (journeyTypeName) {
      case 'space':
        return spaceContext.myMembershipStatus;
      case 'subspace':
        return subspaceContext.myMembershipStatus;
      case 'subsubspace':
        return subsubspaceContext.myMembershipStatus;
    }
  };

  const getJourneyProfile = () => {
    switch (journeyTypeName) {
      case 'space':
        return spaceContext.profile;
      case 'subspace':
        return subspaceContext.profile;
      case 'subsubspace':
        return subsubspaceContext.profile;
    }
  };

  const journeyProfile = getJourneyProfile();

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
                journeyType: journeyTypeName && t(`common.${journeyTypeName}` as const),
                ownerName: createdBy?.profile.displayName,
              }}
              components={{
                ownerlink: createdBy ? (
                  <RouterLink to={createdBy.profile.url} underline="always" onClick={handleAuthorClick} />
                ) : (
                  <span />
                ),
                journeylink: journeyProfile ? <RouterLink to={journeyProfile.url} underline="always" /> : <span />,
                signinlink: <RouterLink to={buildLoginUrl(pathname)} state={{}} underline="always" />,
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
        {!readonlyReason && (
          <>
            <LastSavedCaption date={lastSuccessfulSavedDate} />
          </>
        )}
        {directMessageDialog}
      </Actions>
      <DialogWithGrid open={isLearnWhyDialogOpen} onClose={() => setIsLearnWhyDialogOpen(false)}>
        <DialogHeader
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

const LastSavedCaption = ({ date }: { date: Date | undefined }) => {
  const { t } = useTranslation();

  // Re-rendering every second
  const [formattedTime, setFormattedTime] = useState<string>();

  useEffect(() => {
    const interval = setInterval(() => {
      setFormattedTime(date && formatTimeElapsed(date, t, 'long'));
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, [date]);

  if (!date) {
    return null;
  }

  return <Caption>{t('common.last-saved', { datetime: formattedTime })}</Caption>;
};
