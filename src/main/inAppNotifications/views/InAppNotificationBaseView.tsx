import { Trans, useTranslation } from 'react-i18next';
import { Badge, ListItemButtonProps } from '@mui/material';
import ListItemButton, { ListItemButtonTypeMap } from '@mui/material/ListItemButton/ListItemButton';
import RouterLink, { RouterLinkProps } from '../../../core/ui/link/RouterLink';
import { InAppNotificationState } from '../useInAppNotifications';
import BadgeCardView from '../../../core/ui/list/BadgeCardView';
import Avatar from '../../../core/ui/avatar/Avatar';
import Gutters from '../../../core/ui/grid/Gutters';
import { Caption } from '../../../core/ui/typography';
import { formatTimeElapsed } from '../../../domain/shared/utils/formatTimeElapsed';
import defaultJourneyAvatar from '../../../domain/journey/defaultVisuals/Avatar.jpg';
import { gutters } from '../../../core/ui/grid/utils';
import { Actions } from '../../../core/ui/actions/Actions';

export interface InAppNotificationBaseViewProps {
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
  type,
  state,
  space,
  contributor,
  triggeredAt,
  resource,
  values,
}: InAppNotificationBaseViewProps) => {
  const { t } = useTranslation();

  return (
    <BadgeCardView
      component={Wrapper}
      to={resource.url ?? ''}
      padding
      paddingY={gutters(2)}
      sx={{
        background: theme =>
          state === InAppNotificationState.UNREAD ? theme.palette.highlight.light : theme.palette.background.paper,
        borderRadius: 0,
      }}
      visual={
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={<Avatar size="small" src={contributor?.avatarUrl} />}
        >
          <Avatar size="large" src={space?.avatarUrl || defaultJourneyAvatar} />
        </Badge>
      }
    >
      <Gutters row disablePadding>
        <Gutters column flexGrow={1}>
          <Caption>
            <Trans
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              i18nKey={`components.inAppNotifications.${type}.subject` as any}
              values={values}
              components={{
                b: <strong />,
                br: <br />,
                pre: <pre />,
                i: <em />,
              }}
            />
          </Caption>
          <Caption>
            <Trans
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              i18nKey={`components.inAppNotifications.${type}.description` as any}
              values={values}
              components={{
                b: <strong />,
                br: <br />,
                pre: <pre />,
                i: <em />,
              }}
            />
          </Caption>
        </Gutters>
        <Actions>
          <Caption>{formatTimeElapsed(triggeredAt, t)}</Caption>
        </Actions>
      </Gutters>
    </BadgeCardView>
  );
};
