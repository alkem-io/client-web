import React, { FC } from 'react';
import { Avatar, Box, createStyles, makeStyles, Typography } from '@material-ui/core';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import { Comment } from '../../../../models/discussion/comment';
import Markdown from '../../../core/Markdown';

const AVATAR_SIZE = 5;

const useStyles = makeStyles(theme =>
  createStyles({
    avatar: {
      height: theme.spacing(AVATAR_SIZE),
      width: theme.spacing(AVATAR_SIZE),
      paddingRight: theme.spacing(2),
    },
  })
);

interface DiscussionCommentProps {
  comment: Comment;
}

export const DiscussionComment: FC<DiscussionCommentProps> = ({ comment }) => {
  const styles = useStyles();

  const { author, body } = comment;

  return (
    <Box border={1} borderColor="neutralMedium.main" borderRadius={4}>
      <Box padding={1} display="flex" alignItems="center" justifyContent="space-between" bgcolor="neutralMedium.main">
        <Box display="flex" alignItems="center">
          <Avatar className={styles.avatar} src={author?.avatarUrl}>
            {author?.displayName[0]}
          </Avatar>
          <Box>
            <Typography>{comment.author?.displayName}</Typography>
            <Typography>{comment.createdAt.toLocaleString()}</Typography>
          </Box>
        </Box>
        <DeleteOutlinedIcon fontSize="large" />
      </Box>
      <Box paddingX={1} paddingY={1.5}>
        <Typography>
          <Markdown>{body}</Markdown>
        </Typography>
      </Box>
    </Box>
  );
};
export default DiscussionComment;
