import React, { MouseEventHandler, useEffect, useState } from 'react';
import { gutters } from '../../../../core/ui/grid/utils';
import { CircularProgress, IconButton, Tooltip, useTheme } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { LockOutlined, SaveOutlined } from '@mui/icons-material';
import { Actions } from '../../../../core/ui/actions/Actions';
import { Trans, useTranslation } from 'react-i18next';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { CommunityMembershipStatus, ContentUpdatePolicy } from '../../../../core/apollo/generated/graphql-schema';
import { formatTimeElapsed } from '../../../shared/utils/formatTimeElapsed';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import { useChallenge } from '../../../journey/challenge/hooks/useChallenge';
import { useOpportunity } from '../../../journey/opportunity/hooks/useOpportunity';
import { getJourneyTypeName } from '../../../journey/JourneyTypeName';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { useLocation } from 'react-router-dom';
import { buildLoginUrl } from '../../../../main/routing/urlBuilders';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { Visual } from '../../../common/visual/Visual';

interface WhiteboardDialogFooterProps {
  onSave: () => void;
  lastSavedDate: Date | undefined;
  canUpdateContent: boolean;
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
}

enum ReadonlyReason {
  ContentUpdatePolicy = 'contentUpdatePolicy',
  NoMembership = 'noMembership',
  Unauthenticated = 'unauthenticated',
}

const WhiteboardDialogFooter = ({
  lastSavedDate,
  onSave,
  canUpdateContent,
  contentUpdatePolicy,
  createdBy,
  updating = false,
}: WhiteboardDialogFooterProps) => {
  const { t } = useTranslation();

  const { pathname } = useLocation();

  const { isAuthenticated } = useAuthenticationContext();

  const spaceContext = useSpace();
  const challengeContext = useChallenge();
  const opportunityContext = useOpportunity();

  const getMyMembershipStatus = () => {
    if (opportunityContext.opportunityNameId) {
      return opportunityContext.myMembershipStatus;
    }
    if (challengeContext.challengeNameId) {
      return challengeContext.myMembershipStatus;
    }
    if (spaceContext.spaceNameId) {
      return spaceContext.myMembershipStatus;
    }
  };

  const journeyTypeName = getJourneyTypeName({
    ...opportunityContext,
    ...challengeContext,
    ...spaceContext,
  });

  const journeyProfile = opportunityContext.profile ?? challengeContext.profile ?? spaceContext.profile;

  const readonlyReason = canUpdateContent
    ? null
    : (() => {
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
      })();

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

  return (
    <Actions
      minHeight={gutters(3)}
      paddingX={gutters()}
      marginTop={gutters(-1)}
      gap={gutters(0.5)}
      justifyContent="start"
      alignItems="center"
    >
      <Tooltip placement="right" arrow title={<Caption>{t('pages.whiteboard.saveTooltip')}</Caption>}>
        <IconButton
          color="primary"
          size="small"
          sx={{ marginLeft: -0.5 }}
          onClick={onSave}
          disabled={!canUpdateContent || updating}
        >
          {canUpdateContent ? <SaveOutlined /> : <LockOutlined />}
        </IconButton>
      </Tooltip>
      {readonlyReason ? (
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
            }}
          />
        </Caption>
      ) : (
        <LastSavedCaption saving={updating} date={lastSavedDate} />
      )}
      {directMessageDialog}
    </Actions>
  );
};

export default WhiteboardDialogFooter;

const LastSavedCaption = ({ date, saving }: { date: Date | undefined; saving: boolean | undefined }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Re-rendering every second
  const [formattedTime, setFormattedTime] = useState<string>();

  useEffect(() => {
    const interval = setInterval(() => {
      setFormattedTime(date && formatTimeElapsed(date, t));
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, [date]);

  if (!date) {
    return null;
  }

  return saving ? (
    <Caption title={`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}>
      <CircularProgress size={gutters(0.5)(theme)} sx={{ marginRight: gutters(0.5) }} />
      {t('pages.whiteboard.savingWhiteboard')}
    </Caption>
  ) : (
    <Caption title={`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}>
      {t('common.last-saved', {
        datetime: formattedTime,
      })}
    </Caption>
  );
};
