import { MouseEventHandler, useState } from 'react';
import { gutters } from '@/core/ui/grid/utils';
import { DialogContent } from '@mui/material';
import { Caption } from '@/core/ui/typography';
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
import { RealTimeCollaborationState } from '@/domain/collaboration/realTimeCollaboration/RealTimeCollaborationState';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

interface MemoFooterProps {
  memoUrl: string | undefined;
  canContribute: boolean;
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
  collaborationState: RealTimeCollaborationState | undefined;
}

enum ReadonlyReason {
  Readonly = 'readonly',
  ContentUpdatePolicy = 'contentUpdatePolicy',
  NoMembership = 'noMembership',
  Unauthenticated = 'unauthenticated',
  Connecting = 'connecting',
}

const MemoFooter = ({
  memoUrl,
  canContribute,
  contentUpdatePolicy,
  createdBy,
  collaborationState,
}: MemoFooterProps) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthenticationContext();

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
    // Check collaboration status first
    if (collaborationState?.status !== 'connected') {
      return ReadonlyReason.Connecting;
    }

    // Check if the document is in readonly mode from collaboration state
    if (collaborationState?.readOnly) {
      return ReadonlyReason.Readonly;
    }

    if (canContribute) {
      return null; // User has update privileges and collaboration is connected
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
    if (createdBy) {
      sendMessage('user', {
        id: createdBy.id,
        displayName: createdBy.profile.displayName,
        avatarUri: createdBy.profile.avatar?.uri,
      });
    }
  };

  const [isLearnWhyDialogOpen, setIsLearnWhyDialogOpen] = useState(false);

  const handleLearnWhyClick: MouseEventHandler = event => {
    event.preventDefault();
    setIsLearnWhyDialogOpen(true);
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
        {readonlyReason && (
          <Caption>
            <Trans
              i18nKey={`pages.memo.readonlyReason.${readonlyReason}` as const}
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
                learnwhy: <RouterLink to="" underline="always" onClick={handleLearnWhyClick} />,
              }}
            />
          </Caption>
        )}

        {directMessageDialog}
      </Actions>

      <DialogWithGrid open={isLearnWhyDialogOpen} onClose={() => setIsLearnWhyDialogOpen(false)}>
        <DialogHeader title={'TODO'} onClose={() => setIsLearnWhyDialogOpen(false)} />
        <DialogContent sx={{ paddingTop: 0 }}>
          <WrapperMarkdown>{'TODO'}</WrapperMarkdown>
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default MemoFooter;
