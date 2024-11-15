import React, { FC } from 'react';
import { Box, Skeleton } from '@mui/material';
import Avatar from '@/core/ui/avatar/Avatar';
import { Author } from '../../../shared/components/AuthorAvatar/models/author';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import OverflowGradient from '@/core/ui/overflow/OverflowGradient';

export interface SingleUpdateViewProps {
  author?: Author;
  createdDate?: Date;
  content?: string;
  loading?: boolean;
}

const SingleUpdateView: FC<SingleUpdateViewProps> = ({ author, createdDate, content = '', loading }) => {
  const visual = loading ? (
    <Skeleton variant="rectangular">
      <Avatar />
    </Skeleton>
  ) : (
    <Avatar src={author?.avatarUrl} />
  );

  return (
    <>
      <BadgeCardView visual={visual}>
        {loading ? <Skeleton /> : <Caption>{author?.displayName}</Caption>}
        {loading ? <Skeleton /> : <Caption>{createdDate?.toLocaleString()}</Caption>}
      </BadgeCardView>
      {loading ? (
        <Box paddingY={1}>
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
        </Box>
      ) : (
        <OverflowGradient maxHeight={gutters(11)}>
          <WrapperMarkdown disableParagraphPadding>{content}</WrapperMarkdown>
        </OverflowGradient>
      )}
    </>
  );
};

export default SingleUpdateView;
