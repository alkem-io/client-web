import React, { FC } from 'react';
import { Grid, Skeleton, Avatar, Box } from '@mui/material';
import { Author } from '../../models/discussion/author';
import Markdown from '../../components/core/Markdown';

export interface SingleUpdateViewProps {
  author: Author;
  createdDate: Date;
  content: string;
  loading?: boolean;
}

const SingleUpdateView: FC<SingleUpdateViewProps> = ({ author, createdDate, content, loading }) => {
  return (
    <>
      <Grid container spacing={1}>
        <Grid item>
          {loading ? (
            <Skeleton variant="rectangular">
              <Avatar src={author.avatarUrl} />
            </Skeleton>
          ) : (
            <Avatar />
          )}
        </Grid>
        <Grid item xs>
          <Grid item>{loading ? <Skeleton /> : author.displayName}</Grid>
          <Grid item>{loading ? <Skeleton /> : createdDate.toLocaleString()}</Grid>
        </Grid>
      </Grid>
      {loading ? (
        <Box paddingY={1}>
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
          <Skeleton sx={{ marginBottom: t => t.spacing(0.5) }} />
        </Box>
      ) : (
        <Markdown children={content} />
      )}
    </>
  );
};
export default SingleUpdateView;
