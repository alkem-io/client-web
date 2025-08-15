import { MouseEventHandler, useState, useEffect, useRef } from 'react';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { Trans, useTranslation } from 'react-i18next';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { CommunityMembershipStatus, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import RouterLink from '@/core/ui/link/RouterLink';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import { Identifiable } from '@/core/utils/Identifiable';
import { Visual } from '@/domain/common/visual/Visual';
import {
  MemoStatus,
  RealTimeCollaborationState,
} from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { DialogContent } from '@mui/material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';

interface MemoFooterProps {
  memoUrl: string | undefined;
  createdBy:
    | (Identifiable & {
        profile: {
          displayName: string;
          url: string;
          avatar?: Visual;
        };
      })
    | undefined;
  collaborationState: RealTimeCollaborationState | undefined;
}

enum ReadonlyReason {
  Readonly = 'readonly',
  ContentUpdatePolicy = 'contentUpdatePolicy',
  NoMembership = 'noMembership',
  Unauthenticated = 'unauthenticated',
  Connecting = 'connecting',
  NotSynced = 'notSynced',
}

const MemoFooter = ({ memoUrl, createdBy, collaborationState }: MemoFooterProps) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthenticationContext();

  const { spaceLevel = SpaceLevel.L0 } = useUrlResolver();
  const { space } = useSpace();
  const { subspace } = useSubSpace();
  const spaceAbout = space.about;
  const subspaceAbout = subspace.about;

  const [delayedReadonlyReason, setDelayedReadonlyReason] = useState<ReadonlyReason | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      case SpaceLevel.L1:
      case SpaceLevel.L2:
        return subspaceAbout.profile;
      default:
        return spaceAbout.profile;
    }
  };

  const spaceAboutProfile = getSpaceAboutProfile();

  const getReadonlyReason = () => {
    if (collaborationState?.status !== MemoStatus.CONNECTED) {
      return ReadonlyReason.Connecting;
    }

    if (!isAuthenticated) {
      return ReadonlyReason.Unauthenticated;
    }

    if (getMyMembershipStatus() !== CommunityMembershipStatus.Member) {
      return ReadonlyReason.NoMembership;
    }

    if (!collaborationState?.synced) {
      return ReadonlyReason.NotSynced;
    }

    // The default if none of the above applies but the memo is still read-only.
    if (collaborationState?.readOnly) {
      return ReadonlyReason.Readonly;
    }

    return null;
  };

  const [isLearnWhyDialogOpen, setIsLearnWhyDialogOpen] = useState(false);

  const handleLearnWhyClick: MouseEventHandler = event => {
    event.preventDefault();
    setIsLearnWhyDialogOpen(true);
  };

  const readonlyReason = getReadonlyReason();

  // If there's a new reason, wait a bit before showing it.
  // This prevents flickering for very short-lived states.
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (readonlyReason) {
      timerRef.current = setTimeout(() => {
        setDelayedReadonlyReason(readonlyReason);
      }, 500); // 500ms delay
    } else {
      setDelayedReadonlyReason(null);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [readonlyReason]);

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const handleAuthorClick: MouseEventHandler = event => {
    event.preventDefault();
    if (createdBy) {
      sendMessage('user', {
        id: createdBy.id,
        displayName: createdBy.profile.displayName,
        avatarUri: createdBy.profile.avatar?.uri,
      });
    }
  };

  return (
    <>
      <Actions
        paddingX={gutters()}
        paddingY={gutters(0.5)}
        gap={gutters(0.5)}
        justifyContent="start"
        alignItems="center"
      >
        {delayedReadonlyReason && (
          <Caption>
            <Trans
              i18nKey={`pages.memo.readonlyReason.${delayedReadonlyReason}` as const}
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
                signinlink: <RouterLink to={buildLoginUrl(memoUrl)} state={{}} underline="always" />,
                learnwhy: collaborationState?.readOnly ? (
                  <RouterLink to="" underline="always" onClick={handleLearnWhyClick} />
                ) : (
                  <span />
                ),
              }}
            />
          </Caption>
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
            {t(`pages.memo.readonlyDialog.reason.${collaborationState?.readOnlyCode ?? 'generic'}` as const)}
          </WrapperMarkdown>
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default MemoFooter;
