import { DeleteOutlined } from '@mui/icons-material';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC } from 'react';
import { Comment } from '../../../../models/discussion/comment';
import Markdown from '../../../core/Markdown';

const AVATAR_SIZE = 5;

const useStyles = makeStyles(theme =>
  createStyles({
    avatar: {
      height: theme.spacing(AVATAR_SIZE),
      width: theme.spacing(AVATAR_SIZE),
      marginRight: theme.spacing(2),
    },
    commentContainer: {
      overflowWrap: 'break-word',
    },
  })
);

interface DiscussionCommentProps {
  comment: Comment;
  canDelete: boolean;
  onDelete?: (discussionId: string, msgId?: string) => Promise<void> | void;
  isRootComment?: boolean;
}

export const DiscussionComment: FC<DiscussionCommentProps> = ({ comment, canDelete, onDelete, isRootComment }) => {
  const styles = useStyles();

  const { author, body, id } = comment;

  return (
    <Box
      component={Paper}
      elevation={1}
      bgcolor={isRootComment ? 'background.paper' : 'background.default'}
      borderRadius={1}
    >
      <Box
        padding={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        bgcolor={isRootComment ? 'background.paper' : 'neutralMedium.light'}
      >
        <Box display="flex" alignItems="center">
          <Avatar className={styles.avatar} src={author?.avatarUrl} variant="rounded">
            {author?.displayName[0]}
          </Avatar>
          <Box>
            <Typography variant="body1">{comment.author?.displayName}</Typography>
            <Typography variant="body2" color="neutralMedium.dark">{`${
              isRootComment ? 'started the discussion on ' : 'on '
            }${comment.createdAt.toLocaleString()}`}</Typography>
          </Box>
        </Box>
        {canDelete && onDelete && (
          <IconButton aria-label="Delete" onClick={() => onDelete(id)} size={'large'}>
            <DeleteOutlined />
          </IconButton>
        )}
      </Box>
      <Box paddingX={1} paddingY={1} className={styles.commentContainer}>
        <Markdown>{body}</Markdown>
      </Box>
    </Box>
  );
};
export default DiscussionComment;
