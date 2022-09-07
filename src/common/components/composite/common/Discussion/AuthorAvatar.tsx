import React, { FC, useMemo } from 'react';
import { Avatar, styled, AvatarProps, Tooltip, Link } from '@mui/material';
import UserCard from '../cards/user-card/UserCard';
import { Author } from '../../../../../models/discussion/author';

const UserAvatar = styled(props => <Avatar {...props} />)<AvatarProps>(({ theme }) => ({
  height: theme.spacing(theme.comments.avatarSize),
  width: theme.spacing(theme.comments.avatarSize),
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
                displayName={author?.displayName}
                avatarSrc={author?.avatarUrl}
                tags={author?.tags || []}
                roleName={author?.roleName}
                city={author?.city}
                country={author?.country}
                url={author?.url}
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
        <UserAvatar src={author?.avatarUrl} variant="rounded" sx={{ borderRadius: 1.5 }}>
          {author?.displayName[0]}
        </UserAvatar>
      </Link>
    </TooltipElement>
  );
};

export default AuthorAvatar;
