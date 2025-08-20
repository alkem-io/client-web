import React, { PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, ListItemButton, ListItemButtonProps, ListItemButtonTypeMap, Paper } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { Caption } from '@/core/ui/typography';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import RouterLink, { RouterLinkProps } from '@/core/ui/link/RouterLink';
import { gutters } from '@/core/ui/grid/utils';
import Avatar from '@/core/ui/avatar/Avatar';
import SwapColors from '@/core/ui/palette/SwapColors';
import Gutters from '@/core/ui/grid/Gutters';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import getActivityIcon, { Activity } from './ActivityIcon';
import ActivityViewFooter from './ActivityViewFooter';

export interface ActivityBaseViewProps {
  title: ReactNode;
  avatarUrl?: string;
  avatarName?: string;
  loading?: boolean;
  url: string;
  createdDate: Date | string;
  contextDisplayName: ReactNode;
}

const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>(
  props: ListItemButtonProps<D, P> & RouterLinkProps
) => <ListItemButton component={RouterLink} {...props} />;

export const ActivityBaseView = ({
  avatarUrl,
  avatarName,
  title,
  loading,
  url,
  children,
  createdDate,
  contextDisplayName,
  ...activity
}: PropsWithChildren<ActivityBaseViewProps & (Activity | { type: undefined })>) => {
  const ActivityIcon = activity.type && getActivityIcon(activity);
  const { t } = useTranslation();

  return (
    <BadgeCardView
      component={Wrapper}
      to={url}
      padding
      visual={
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <SwapColors>
              <Paper
                sx={{
                  borderRadius: '50%',
                  width: gutters(1.1),
                  height: gutters(1.1),
                  fontSize: gutters(0.75),
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {ActivityIcon && <ActivityIcon fontSize="inherit" />}
              </Paper>
            </SwapColors>
          }
        >
          {loading ? (
            <Skeleton
              variant="rectangular"
              sx={{
                width: gutters(2),
                height: gutters(2),
              }}
            />
          ) : (
            <Avatar
              src={avatarUrl}
              sx={{ borderRadius: 1.2 }}
              alt={avatarName ? t('common.avatar-of', { user: avatarName }) : t('common.avatar')}
            />
          )}
        </Badge>
      }
    >
      <Gutters row disablePadding justifyContent="space-between" gap={gutters(0.5)}>
        {loading ? (
          <Skeleton width="60%" />
        ) : (
          <>
            <Caption noWrap flexGrow={1} minWidth={0} flexShrink={1}>
              {title}
            </Caption>
            <Caption>{formatTimeElapsed(createdDate, t)}</Caption>
          </>
        )}
      </Gutters>
      {loading && <Skeleton />}
      {!loading && <ActivityViewFooter contextDisplayName={contextDisplayName} />}
      {loading && <Skeleton />}
    </BadgeCardView>
  );
};
