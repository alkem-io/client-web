import { Avatar, Link, Tooltip } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { RouterLink } from '../../../core/RouterLink';
import { UserCard, UserCardProps } from '../cards';

interface UserAvatarProps extends UserCardProps {}

export const UserAvatar: FC<UserAvatarProps> = ({ url, ...rest }) => {
  const userCard = useMemo(() => {
    return <UserCard {...rest} url="" />;
  }, [rest, url]);

  return (
    <Link component={RouterLink} to={url} underline="none" aria-label="user-avatar">
      <Tooltip arrow title={userCard}>
        <Avatar src={rest.avatarSrc} variant="rounded">
          {rest.displayName[0]}
        </Avatar>
      </Tooltip>
    </Link>
  );
};
export default UserAvatar;
