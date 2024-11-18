import { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Badge, ListItemButtonProps } from '@mui/material';
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
import { Actions } from '../../../core/ui/actions/Actions';
import ActionsMenu from '../../../core/ui/card/ActionsMenu';
import MenuItemWithIcon from '../../../core/ui/menu/MenuItemWithIcon';
import { InAppNotificationState } from '../../../core/apollo/generated/graphql-schema';
import { useInAppNotifications } from '../useInAppNotifications';
import { useInAppNotificationsContext } from '../InAppNotificationsContext';

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
) => <ListItemButton component={RouterLink} {...props} />;

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
  }, [id]);

  const getReadAction = useCallback(() => {
    switch (state) {
      case InAppNotificationState.Unread:
        return (
          <MenuItemWithIcon
            key={`${id}-mark-as-read`}
            iconComponent={DraftsOutlinedIcon}
            onClick={() => updateNotificationState(id, InAppNotificationState.Read)}
          >
            Mark as Read
          </MenuItemWithIcon>
        );
      case InAppNotificationState.Read:
        return (
          <MenuItemWithIcon
            key={`${id}-mark-as-unread`}
            iconComponent={MarkEmailUnreadOutlinedIcon}
            onClick={() => updateNotificationState(id, InAppNotificationState.Unread)}
          >
            Mark as Unread
          </MenuItemWithIcon>
        );
      default:
        return null;
    }
  }, [id, state]);

  const renderActions = useCallback(
    () => [
      getReadAction(),
      <MenuItemWithIcon
        key={`${id}-delete`}
        iconComponent={DeleteOutline}
        onClick={() => updateNotificationState(id, InAppNotificationState.Archived)}
      >
        Delеte
      </MenuItemWithIcon>,
    ],
    [getReadAction, id]
  );

  const renderFormattedTranslation = (key: string) => {
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
  };

  return (
    <BadgeCardView
      component={Wrapper}
      to={resource.url ?? ''}
      onClick={onNotificationClick}
      padding
      paddingY={gutters(2)}
      sx={{
        background: theme =>
          state === InAppNotificationState.Unread ? theme.palette.highlight.light : theme.palette.background.paper,
        borderRadius: 0,
      }}
      visual={
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={contributor ? <Avatar size="small" src={contributor?.avatarUrl} /> : null}
        >
          <Avatar size="large" src={space?.avatarUrl || defaultJourneyAvatar} />
        </Badge>
      }
    >
      <Gutters row disablePadding>
        <Gutters column flexGrow={1}>
          <Caption>{renderFormattedTranslation(`components.inAppNotifications.${type}.subject`)}</Caption>
          <Caption>{renderFormattedTranslation(`components.inAppNotifications.${type}.description`)}</Caption>
        </Gutters>
        <Actions>
          <Caption>{formatTimeElapsed(triggeredAt, t)}</Caption>
          <ActionsMenu>{renderActions()}</ActionsMenu>
        </Actions>
      </Gutters>
    </BadgeCardView>
  );
};
