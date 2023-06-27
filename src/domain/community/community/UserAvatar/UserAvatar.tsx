import { Avatar, Tooltip } from '@mui/material';
import React, { FC } from 'react';
import { UserCard, UserCardProps } from '../../../../common/components/composite/common/cards';
import ConditionalLink from '../../../../common/components/core/ConditionalLink';

interface UserAvatarProps extends UserCardProps {}

export const UserAvatar: FC<UserAvatarProps> = ({ url, ...rest }) => {
  return (
    <ConditionalLink condition={!!url} to={url} aria-label="user-avatar">
      <Tooltip arrow title={<UserCard {...rest} url="" />}>
        <Avatar src={rest.avatarSrc} variant="rounded">
          {rest.displayName && rest.displayName[0]}
        </Avatar>
      </Tooltip>
    </ConditionalLink>
  );
};

export default UserAvatar;
