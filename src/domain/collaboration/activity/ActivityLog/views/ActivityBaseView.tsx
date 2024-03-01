import React, { FC, ReactNode } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { Caption } from '../../../../../core/ui/typography';
import BadgeCardView from '../../../../../core/ui/list/BadgeCardView';
import RouterLink, { RouterLinkProps } from '../../../../../core/ui/link/RouterLink';
import { gutters } from '../../../../../core/ui/grid/utils';
import Avatar from '../../../../../core/ui/avatar/Avatar';
import { Badge, ListItemButtonProps, Paper } from '@mui/material';
import SwapColors from '../../../../../core/ui/palette/SwapColors';
import getActivityIcon, { Activity } from './ActivityIcon';
import ListItemButton, { ListItemButtonTypeMap } from '@mui/material/ListItemButton/ListItemButton';
import ActivityViewFooter from './ActivityViewFooter';

export interface ActivityBaseViewProps {
  title: ReactNode;
  avatarUrl?: string;
  loading?: boolean;
  url: string;
  createdDate: Date | string;
  contextDisplayName: ReactNode;
}

const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = {}>(
  props: ListItemButtonProps<D, P> & RouterLinkProps
) => <ListItemButton component={RouterLink} {...props} />;

export const ActivityBaseView: FC<ActivityBaseViewProps & (Activity | { type: undefined })> = ({
  avatarUrl,
  title,
  loading,
  url,
  children,
  createdDate,
  contextDisplayName,
  ...activity
}) => {
  const ActivityIcon = activity.type && getActivityIcon(activity);

  return (
    <BadgeCardView
      component={Wrapper}
      to={url}
      sx={{ padding: 1 }}
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
            <Avatar src={avatarUrl} sx={{ borderRadius: 1.2 }} />
          )}
        </Badge>
      }
    >
      <Caption>{loading ? <Skeleton width="60%" /> : title}</Caption>
      {loading && <Skeleton />}
      {!loading && <ActivityViewFooter contextDisplayName={contextDisplayName} createdDate={createdDate} />}
      {loading && <Skeleton />}
    </BadgeCardView>
  );
};
