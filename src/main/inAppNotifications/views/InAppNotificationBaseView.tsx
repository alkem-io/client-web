import { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Badge,
  Box,
  Divider,
  ListItemButton,
  ListItemButtonProps,
  ListItemButtonTypeMap,
  Typography,
} from '@mui/material';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import { DeleteOutline } from '@mui/icons-material';
import RouterLink, { RouterLinkProps } from '@/core/ui/link/RouterLink';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import Avatar from '@/core/ui/avatar/Avatar';
import Gutters from '@/core/ui/grid/Gutters';
import { Caption } from '@/core/ui/typography';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { gutters } from '@/core/ui/grid/utils';
import ActionsMenu from '@/core/ui/card/ActionsMenu';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import { NotificationEventInAppState, VisualType } from '@/core/apollo/generated/graphql-schema';
import { useInAppNotifications } from '../useInAppNotifications';
import { useInAppNotificationsContext } from '../InAppNotificationsContext';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { InAppNotificationModel } from '../model/InAppNotificationModel';
import { useScreenSize } from '@/core/ui/grid/constants';

const ACTIONS_WIDTH = 60;

interface InAppNotificationBaseViewProps {
  notification: InAppNotificationModel;
  values: Record<string, string | undefined>;
  url: string | undefined;
}

const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>(
  props: ListItemButtonProps<D, P> & RouterLinkProps
) => <ListItemButton component={props.to ? RouterLink : Box} {...props} />;

const getSpaceAvatar = (space?: {
  id?: string;
  about?: { profile?: { cardBanner?: { uri?: string }; avatar?: { uri?: string } } };
}) => {
  return space?.about?.profile?.avatar?.uri || space?.about?.profile?.cardBanner?.uri || null;
};

export const InAppNotificationBaseView = ({ notification, values, url }: InAppNotificationBaseViewProps) => {
  const { id, state, triggeredAt, triggeredBy, payload, type } = notification;

  const { t } = useTranslation();
  const { updateNotificationState } = useInAppNotifications();
  const { setIsOpen } = useInAppNotificationsContext();
  const { isMediumSmallScreen: isMobile } = useScreenSize();

  const onNotificationClick = useCallback(() => {
    if (state === NotificationEventInAppState.Unread) {
      updateNotificationState(id, NotificationEventInAppState.Read);
    }
    if (url) {
      setIsOpen(false);
    }
  }, [id, url, state]);

  const getReadAction = useCallback(() => {
    switch (state) {
      case NotificationEventInAppState.Unread:
        return (
          <MenuItemWithIcon
            key={`${id}-mark-as-read`}
            iconComponent={DraftsOutlinedIcon}
            onClick={() => updateNotificationState(id, NotificationEventInAppState.Read)}
          >
            {t('components.inAppNotifications.action.read')}
          </MenuItemWithIcon>
        );
      case NotificationEventInAppState.Read:
        return (
          <MenuItemWithIcon
            key={`${id}-mark-as-unread`}
            iconComponent={MarkEmailUnreadOutlinedIcon}
            onClick={() => updateNotificationState(id, NotificationEventInAppState.Unread)}
          >
            {t('components.inAppNotifications.action.unread')}
          </MenuItemWithIcon>
        );
      default:
        return null;
    }
  }, [id, state, updateNotificationState]);

  const renderActions = useCallback(
    () => [
      getReadAction(),
      <MenuItemWithIcon
        key={`${id}-delete`}
        iconComponent={DeleteOutline}
        onClick={() => updateNotificationState(id, NotificationEventInAppState.Archived)}
      >
        {t('components.inAppNotifications.action.delete')}
      </MenuItemWithIcon>,
    ],
    [getReadAction, id, updateNotificationState, t]
  );

  const renderFormattedTranslation = useCallback(
    (key: string) => {
      return (
        <Trans
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          i18nKey={key as any}
          values={values}
          components={{
            b: <strong />,
            br: <br />,
            pre: <pre />,
            i: <em />,
          }}
        />
      );
    },
    [values]
  );

  const renderComments = useCallback(() => {
    if (values.comment) {
      return (
        <WrapperMarkdown
          plain
          disableParagraphPadding
          caption
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            ...(isMobile && {
              WebkitLineClamp: 1,
            }),
          }}
        >
          {values.comment}
        </WrapperMarkdown>
      );
    }

    return null;
  }, [values, isMobile]);

  const isUnread = state === NotificationEventInAppState.Unread;

  return (
    <>
      <BadgeCardView
        component={Wrapper}
        to={url}
        onClick={onNotificationClick}
        paddingLeft={isMobile ? gutters(0.5) : gutters(2)}
        paddingY={gutters(0.5)}
        sx={{
          borderRadius: 0,
        }}
        visual={
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={triggeredBy ? <Avatar size="small" src={triggeredBy?.profile?.visual?.uri} /> : null}
          >
            <Avatar
              size="regular"
              src={getSpaceAvatar(payload.space) || getDefaultSpaceVisualUrl(VisualType.Avatar, payload.space?.id)}
              alt={t('common.avatar')}
            />
          </Badge>
        }
      >
        <Gutters row disablePadding>
          <Gutters
            flexGrow={1}
            disablePadding
            disableGap
            justifyContent={'center'}
            sx={{ maxWidth: `calc(100% - ${ACTIONS_WIDTH}px)` }}
          >
            <Typography
              variant="h4"
              color="primary"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                fontWeight: isUnread ? 'bold' : 'normal',
                marginBottom: gutters(0.5),
              }}
            >
              {isUnread && (
                <Box
                  sx={{
                    width: '10px',
                    minWidth: '10px',
                    height: '10px',
                    background: '#09BCD4',
                    borderRadius: '50%',
                    marginRight: gutters(0.5),
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />
              )}
              <Box
                component="span"
                sx={{
                  flex: 1,
                  ...(isMobile && {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word',
                  }),
                }}
              >
                {renderFormattedTranslation(`components.inAppNotifications.type.${type}.subject`)}
              </Box>
            </Typography>
            <Typography
              variant="body2"
              color="neutral.light"
              sx={{
                ...(isMobile && {
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                }),
              }}
            >
              {renderFormattedTranslation(`components.inAppNotifications.type.${type}.description`)}
            </Typography>
            {renderComments()}
          </Gutters>
          <Gutters disablePadding alignItems={'center'}>
            <ActionsMenu>{renderActions()}</ActionsMenu>
            <Caption>{formatTimeElapsed(triggeredAt, t)}</Caption>
          </Gutters>
        </Gutters>
      </BadgeCardView>
      {!isMobile && (
        <Gutters row disablePadding disableGap display={'flex'} justifyContent={'center'}>
          <Divider sx={{ maxWidth: '300px', flex: 1 }} />
        </Gutters>
      )}
    </>
  );
};
