import React, { FC } from 'react';
import { Avatar, Box, createStyles, makeStyles, Typography } from '@material-ui/core';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import { Comment } from '../../../../models/discussion/comment';
import Markdown from '../../../core/Markdown';
import IconButton from '@material-ui/core/IconButton';

const AVATAR_SIZE = 5;

const useStyles = makeStyles(theme =>
  createStyles({
    avatar: {
      height: theme.spacing(AVATAR_SIZE),
      width: theme.spacing(AVATAR_SIZE),
      marginRight: theme.spacing(2),
    },
  })
);

interface DiscussionCommentProps {
  comment: Comment;
  canDelete: boolean;
  onDelete?: (ID: string) => Promise<void> | void;
}

export const DiscussionComment: FC<DiscussionCommentProps> = ({ comment, canDelete, onDelete }) => {
  const styles = useStyles();

  const { author, body, id } = comment;

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
        {canDelete && onDelete && (
          <IconButton aria-label="Delete" onClick={() => onDelete(id)}>
            <DeleteOutlinedIcon fontSize="large" />
          </IconButton>
        )}
      </Box>
      <Box paddingX={1} paddingY={1.5}>
        <Markdown>{body}</Markdown>
      </Box>
    </Box>
  );
};
export default DiscussionComment;
