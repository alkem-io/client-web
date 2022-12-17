import React, { FC, useMemo } from 'react';
import { Avatar, styled, AvatarProps, Tooltip, Link } from '@mui/material';
import UserCard from '../../../../common/components/composite/common/cards/user-card/UserCard';
import { Author } from './models/author';

const UserAvatar = styled(props => <Avatar {...props} />)<AvatarProps>(({ theme }) => ({
  height: theme.avatarSizeXs,
  width: theme.avatarSizeXs,
}));

export interface AuthorAvatarProps {
  author: Author | undefined;
}

export const AuthorAvatar: FC<AuthorAvatarProps> = ({ author }) => {
  const TooltipElement = useMemo(
    () =>
      ({ children }) =>
        author ? (
          <Tooltip
            arrow
            title={
              <UserCard
                displayName={author.displayName}
                avatarSrc={author.avatarUrl}
                tags={author.tags || []}
                roleName={author.roleName}
                city={author.city}
                country={author.country}
                url={author.url}
              />
            }
            PopperProps={{
              sx: { '& > .MuiTooltip-tooltip': { background: 'transparent' } },
            }}
          >
            {children}
          </Tooltip>
        ) : (
          <>{children}</>
        ),
    [author]
  );

  return (
    <TooltipElement>
      <Link href={author?.url}>
        <UserAvatar src={author?.avatarUrl}>{author?.displayName[0]}</UserAvatar>
      </Link>
    </TooltipElement>
  );
};

export default AuthorAvatar;
