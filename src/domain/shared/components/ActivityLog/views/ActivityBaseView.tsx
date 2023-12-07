import React, { FC, ReactNode } from 'react';
import Skeleton from '@mui/material/Skeleton';
import AuthorAvatar from '../../AuthorAvatar/AuthorAvatar';
import { Author } from '../../AuthorAvatar/models/author';
import { Caption } from '../../../../../core/ui/typography';
import BadgeCardView from '../../../../../core/ui/list/BadgeCardView';
import RouterLink from '../../../../../core/ui/link/RouterLink';

export interface ActivityBaseViewProps {
  title: ReactNode;
  author: Author | undefined;
  loading?: boolean;
  url?: string;
}

export const ActivityBaseView: FC<ActivityBaseViewProps> = ({ author, title, loading, url, children }) => {
  return (
    <BadgeCardView
      visual={
        loading ? (
          <Skeleton>
            <AuthorAvatar author={undefined} />
          </Skeleton>
        ) : (
          <AuthorAvatar author={author} />
        )
      }
    >
      <Caption>{loading ? <Skeleton width="60%" /> : title}</Caption>
      {loading ? (
        <Skeleton />
      ) : url ? (
        <RouterLink to={url} loose>
          {children}
        </RouterLink>
      ) : (
        children
      )}
    </BadgeCardView>
  );
};
