import { Avatar, Tooltip } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { UserCard, UserCardProps } from '../cards';
import ConditionalLink from '../../../core/ConditionalLink';

interface UserAvatarProps extends UserCardProps {}

export const UserAvatar: FC<UserAvatarProps> = ({ url, ...rest }) => {
  const userCard = useMemo(() => {
    return <UserCard {...rest} url="" />;
  }, [rest, url]);

  return (
    <ConditionalLink condition={!!url} to={url} aria-label="user-avatar">
      <Tooltip arrow title={userCard}>
        <Avatar src={rest.avatarSrc} variant="rounded">
          {rest.displayName && rest.displayName[0]}
        </Avatar>
      </Tooltip>
    </ConditionalLink>
  );
};
export default UserAvatar;
