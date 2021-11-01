import { Avatar, Box, createStyles, Link, makeStyles, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import Markdown from '../../../core/Markdown';

const useStyles = makeStyles(theme =>
  createStyles({
    avatar: {
      height: theme.spacing(8),
      width: theme.spacing(8),
    },
  })
);

interface DiscussionCommentProps {
  commentId: string;
  message: string;
  createdOn: string;
  createdBy: string;
  depth: number;
}

export const DiscussionComment: FC<DiscussionCommentProps> = ({ commentId, message, createdOn, createdBy, depth }) => {
  const styles = useStyles();

  const depthPadding = depth > 0 ? depth * 8 + 2 : 0;

  return (
    <Box paddingY={2} display="flex" justifyContent="space-between">
      <Box display="flex" flexDirection="row" paddingLeft={depthPadding}>
        <Avatar className={styles.avatar} src="">
          {createdBy[0]}
        </Avatar>
        <Box display="flex" flexDirection="column" paddingX={2}>
          <Typography>
            <Markdown>{message}</Markdown>
          </Typography>
          <Typography variant="body2">
            {`${createdBy} on ${createdOn}`} - <Link href={`#${commentId}`}>Replay to this comment</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
export default DiscussionComment;
