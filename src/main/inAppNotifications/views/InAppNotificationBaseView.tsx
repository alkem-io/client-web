import { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Badge, Box, Divider, ListItemButtonProps, Typography } from '@mui/material';
import ListItemButton, { ListItemButtonTypeMap } from '@mui/material/ListItemButton/ListItemButton';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import { DeleteOutline } from '@mui/icons-material';
import RouterLink, { RouterLinkProps } from '../../../core/ui/link/RouterLink';
import BadgeCardView from '../../../core/ui/list/BadgeCardView';
import Avatar from '../../../core/ui/avatar/Avatar';
import Gutters from '../../../core/ui/grid/Gutters';
import { Caption } from '../../../core/ui/typography';
import { formatTimeElapsed } from '../../../domain/shared/utils/formatTimeElapsed';
import defaultJourneyAvatar from '../../../domain/journey/defaultVisuals/Avatar.jpg';
import { gutters } from '../../../core/ui/grid/utils';
import ActionsMenu from '../../../core/ui/card/ActionsMenu';
import MenuItemWithIcon from '../../../core/ui/menu/MenuItemWithIcon';
import { InAppNotificationState } from '../../../core/apollo/generated/graphql-schema';
import { useInAppNotifications } from '../useInAppNotifications';
import { useInAppNotificationsContext } from '../InAppNotificationsContext';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';

const MAX_LENGTH_COMMENT = 150; // 150 characters

export interface InAppNotificationBaseViewProps {
  id: string;
  type: string; // to support _ADMIN
  state: InAppNotificationState;
  space?: {
    avatarUrl: string;
  };
  resource: {
    url: string;
  };
  contributor?: {
    avatarUrl: string;
  };
  triggeredAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any;
}

const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>(
  props: ListItemButtonProps<D, P> & RouterLinkProps
) => <ListItemButton component={props.to ? RouterLink : Box} {...props} />;

export const InAppNotificationBaseView = ({
  id,
  type,
  state,
  space,
  contributor,
  triggeredAt,
  resource,
  values,
}: InAppNotificationBaseViewProps) => {
  const { t } = useTranslation();
  const { updateNotificationState } = useInAppNotifications();
  const { setIsOpen } = useInAppNotificationsContext();

  const onNotificationClick = useCallback(() => {
    if (state === InAppNotificationState.Unread) {
      updateNotificationState(id, InAppNotificationState.Read);
    }
    setIsOpen(false);
  }, [id, state]);

  const getReadAction = useCallback(() => {
    switch (state) {
      case InAppNotificationState.Unread:
        return (
          <MenuItemWithIcon
            key={`${id}-mark-as-read`}
            iconComponent={DraftsOutlinedIcon}
            onClick={() => updateNotificationState(id, InAppNotificationState.Read)}
          >
            {t('components.inAppNotifications.action.read')}
          </MenuItemWithIcon>
        );
      case InAppNotificationState.Read:
        return (
          <MenuItemWithIcon
            key={`${id}-mark-as-unread`}
            iconComponent={MarkEmailUnreadOutlinedIcon}
            onClick={() => updateNotificationState(id, InAppNotificationState.Unread)}
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
        onClick={() => updateNotificationState(id, InAppNotificationState.Archived)}
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

  const getTruncatedComment = (comment: string | undefined = '') => {
    if (comment.length <= MAX_LENGTH_COMMENT) {
      return comment;
    }

    return `${comment.slice(0, MAX_LENGTH_COMMENT)}...`;
  };

  const renderComments = useCallback(() => {
    if (values.comment) {
      return (
        <WrapperMarkdown disableParagraphPadding caption plain>
          {getTruncatedComment(values.comment)}
        </WrapperMarkdown>
      );
    }

    return null;
  }, [values]);

  const isUnread = state === InAppNotificationState.Unread;

  return (
    <>
      <BadgeCardView
        component={Wrapper}
        to={resource.url}
        onClick={onNotificationClick}
        paddingX={gutters(2)}
        paddingY={gutters(0.5)}
        sx={{
          borderRadius: 0,
        }}
        visual={
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={contributor ? <Avatar size="small" src={contributor?.avatarUrl} /> : null}
          >
            <Avatar size="regular" src={space?.avatarUrl || defaultJourneyAvatar} />
          </Badge>
        }
      >
        <Gutters row disablePadding>
          <Gutters column flexGrow={1} disableGap justifyContent={'center'}>
            <Typography
              variant="h4"
              color="primary"
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                fontWeight: isUnread ? 'bold' : 'normal',
                marginBottom: gutters(0.5),
              }}
            >
              {isUnread && (
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    background: '#09BCD4',
                    borderRadius: '50%',
                    marginRight: gutters(0.5),
                  }}
                />
              )}
              {renderFormattedTranslation(`components.inAppNotifications.type.${type}.subject`)}
            </Typography>
            <Typography variant="body2" color="neutral.light">
              {renderFormattedTranslation(`components.inAppNotifications.type.${type}.description`)}
            </Typography>
            {renderComments()}
          </Gutters>
          <Gutters alignItems={'center'}>
            <Caption>{formatTimeElapsed(triggeredAt, t)}</Caption>
            <ActionsMenu>{renderActions()}</ActionsMenu>
          </Gutters>
        </Gutters>
      </BadgeCardView>
      <Gutters row disablePadding disableGap display={'flex'} justifyContent={'center'}>
        <Divider sx={{ maxWidth: '300px', flex: 1 }} />
      </Gutters>
    </>
  );
};
