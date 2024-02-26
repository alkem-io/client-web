import { DeleteOutline, LockOutlined, SaveOutlined, SvgIconComponent } from '@mui/icons-material';
import { Button, ButtonProps, CircularProgress, Tooltip, TooltipProps, useTheme } from '@mui/material';
import { FC, MouseEventHandler, forwardRef, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { CommunityMembershipStatus, ContentUpdatePolicy } from '../../../../core/apollo/generated/graphql-schema';
import { useAuthenticationContext } from '../../../../core/auth/authentication/hooks/useAuthenticationContext';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { Caption } from '../../../../core/ui/typography';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { buildLoginUrl } from '../../../../main/routing/urlBuilders';
import { Visual } from '../../../common/visual/Visual';
import useDirectMessageDialog from '../../../communication/messaging/DirectMessaging/useDirectMessageDialog';
import { getJourneyTypeName } from '../../../journey/JourneyTypeName';
import { useChallenge } from '../../../journey/challenge/hooks/useChallenge';
import { useOpportunity } from '../../../journey/opportunity/hooks/useOpportunity';
import { useSpace } from '../../../journey/space/SpaceContext/useSpace';
import { formatTimeElapsed } from '../../../shared/utils/formatTimeElapsed';

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
  onDelete: () => void;
  canDelete?: boolean;
}

enum ReadonlyReason {
  ContentUpdatePolicy = 'contentUpdatePolicy',
  NoMembership = 'noMembership',
  Unauthenticated = 'unauthenticated',
}

const FooterButton: FC<ButtonProps & { iconComponent: SvgIconComponent; tooltip?: TooltipProps }> = forwardRef(
  ({ children, iconComponent: Icon, tooltip, sx, ...props }, ref) => {
    const mergedSx: ButtonProps['sx'] = {
      textTransform: 'none',
      '& .MuiTypography-caption': {
        color: theme => (props.disabled ? theme.palette.text.disabled : theme.palette.text.primary),
        marginLeft: gutters(0.5),
      },
      ...sx,
    };
    return (
      <Button ref={ref} {...props} sx={mergedSx}>
        <Icon fontSize="small" />
        {children}
      </Button>
    );
  }
);

const WhiteboardDialogFooter = ({
  lastSavedDate,
  onSave,
  canUpdateContent,
  onDelete,
  canDelete,
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

  const getJourneyProfile = () => {
    switch (journeyTypeName) {
      case 'space':
        return spaceContext.profile;
      case 'challenge':
        return challengeContext.profile;
      case 'opportunity':
        return opportunityContext.profile;
    }
  };

  const journeyProfile = getJourneyProfile();

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
      {canDelete && (
        <FooterButton
          color="error"
          iconComponent={DeleteOutline}
          onClick={onDelete}
          disabled={!canUpdateContent || updating}
          aria-label={t('buttons.delete')}
        >
          <Caption>{t('buttons.delete')}</Caption>
        </FooterButton>
      )}
      <Tooltip placement="right" arrow title={<Caption>{t('pages.whiteboard.saveTooltip')}</Caption>}>
        <FooterButton
          color="primary"
          iconComponent={canUpdateContent ? SaveOutlined : LockOutlined}
          aria-label={canUpdateContent ? t('buttons.save') : ''}
          onClick={onSave}
          disabled={!canUpdateContent || updating}
        >
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
        </FooterButton>
      </Tooltip>
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

  return (
    <Caption>
      {saving ? (
        <>
          <CircularProgress size={gutters(0.5)(theme)} sx={{ marginRight: gutters(0.5) }} />
          {t('pages.whiteboard.savingWhiteboard')}
        </>
      ) : (
        t('common.last-saved', {
          datetime: formattedTime,
        })
      )}
    </Caption>
  );
};
