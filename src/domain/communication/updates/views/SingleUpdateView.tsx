import React, { FC } from 'react';
import { Avatar, Box, Skeleton } from '@mui/material';
import { Author } from '../../../shared/components/AuthorAvatar/models/author';
import WrapperMarkdown from '../../../../common/components/core/WrapperMarkdown';
import ItemView from '../../../../core/ui/list/ItemView';
import { Caption } from '../../../../core/ui/typography';

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
      <ItemView visual={visual}>
        {loading ? <Skeleton /> : <Caption>{author?.displayName}</Caption>}
        {loading ? <Skeleton /> : <Caption>{createdDate?.toLocaleString()}</Caption>}
      </ItemView>
      {loading ? (
        <Box paddingY={1}>
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
        </Box>
      ) : (
        <WrapperMarkdown>{content}</WrapperMarkdown>
      )}
    </>
  );
};
export default SingleUpdateView;
