import { DeleteOutline } from '@mui/icons-material';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import {
  Badge,
  Box,
  Divider,
  ListItemButton,
  type ListItemButtonProps,
  type ListItemButtonTypeMap,
  Typography,
} from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { NotificationEventInAppState, VisualType } from '@/core/apollo/generated/graphql-schema';
import Avatar from '@/core/ui/avatar/Avatar';
import ActionsMenu from '@/core/ui/card/ActionsMenu';
import { useScreenSize } from '@/core/ui/grid/constants';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink, { type RouterLinkProps } from '@/core/ui/link/RouterLink';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import MenuItemWithIcon from '@/core/ui/menu/MenuItemWithIcon';
import { Caption } from '@/core/ui/typography';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { useInAppNotificationsContext } from '../InAppNotificationsContext';
import type { InAppNotificationModel } from '../model/InAppNotificationModel';
import { useInAppNotifications } from '../useInAppNotifications';

const ACTIONS_WIDTH = 60;

interface InAppNotificationBaseViewProps {
  notification: InAppNotificationModel;
  values: Record<string, string | undefined>;
  url: string | undefined;
  forceReload?: boolean;
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

export const InAppNotificationBaseView = ({
  notification,
  values,
  url,
  forceReload,
}: InAppNotificationBaseViewProps) => {
  const { id, state, triggeredAt, triggeredBy, payload, type } = notification;

  const { t } = useTranslation();
  const { updateNotificationState } = useInAppNotifications();
  const { setIsOpen } = useInAppNotificationsContext();
  const { isMediumSmallScreen: isMobile } = useScreenSize();

  const onNotificationClick = () => {
    if (state === NotificationEventInAppState.Unread) {
      updateNotificationState(id, NotificationEventInAppState.Read);
    }
    if (url) {
      setIsOpen(false);
      if (forceReload) {
        window.location.href = url;
      }
    }
  };

  const getReadAction = () => {
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
  };

  const renderActions = () => [
    getReadAction(),
    <MenuItemWithIcon
      key={`${id}-delete`}
      iconComponent={DeleteOutline}
      onClick={() => updateNotificationState(id, NotificationEventInAppState.Archived)}
    >
      {t('components.inAppNotifications.action.delete')}
    </MenuItemWithIcon>,
  ];

  const renderFormattedTranslation = (key: string) => {
    return (
      <Trans
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
  };

  const renderComments = () => {
    if (values.comment) {
      return (
        <WrapperMarkdown
          plain={true}
          disableParagraphPadding={true}
          caption={true}
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
  };

  const isUnread = state === NotificationEventInAppState.Unread;

  return (
    <>
      <BadgeCardView
        component={Wrapper}
        to={forceReload ? undefined : url}
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
        <Gutters row={true} disablePadding={true}>
          <Gutters
            flexGrow={1}
            disablePadding={true}
            disableGap={true}
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
          <Gutters disablePadding={true} alignItems={'center'}>
            <ActionsMenu>{renderActions()}</ActionsMenu>
            <Caption>{formatTimeElapsed(triggeredAt, t)}</Caption>
          </Gutters>
        </Gutters>
      </BadgeCardView>
      {!isMobile && (
        <Gutters row={true} disablePadding={true} disableGap={true} display={'flex'} justifyContent={'center'}>
          <Divider sx={{ maxWidth: '300px', flex: 1 }} />
        </Gutters>
      )}
    </>
  );
};
