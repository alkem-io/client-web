import React, { FC } from 'react';
import { Author } from '../../models/discussion/author';
import { Grid } from '@mui/material';
import Markdown from '../../components/core/Markdown';
import Avatar from '@mui/material/Avatar';

export interface SingleUpdateViewProps {
  author: Author;
  createdDate: Date;
  content: string;
}

const SingleUpdateView: FC<SingleUpdateViewProps> = ({ author, createdDate, content }) => {
  return (
    <>
      <Grid container spacing={1}>
        <Grid item>
          <Avatar src={author.avatarUrl} />
        </Grid>
        <Grid item xs>
          <Grid item>{author.displayName}</Grid>
          <Grid item>{createdDate.toLocaleString()}</Grid>
        </Grid>
      </Grid>
      <Markdown children={content} />
    </>
  );
};
export default SingleUpdateView;
