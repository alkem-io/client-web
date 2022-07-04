import React, { FC } from 'react';
import { DeleteOutlined } from '@mui/icons-material';
import { Avatar, Box, Paper, Typography, styled, AvatarProps, BoxProps, IconButton } from '@mui/material';
import { Comment } from '../../../../models/discussion/comment';
import Markdown from '../../../core/Markdown';

const AVATAR_SIZE = 5;

const CommentBox = styled(props => <Box {...props} />)<BoxProps>(({ theme }) => ({
  overflowWrap: 'break-word',
  padding: theme.spacing(1),
}));

const UserAvatar = styled(props => <Avatar {...props} />)<AvatarProps>(({ theme }) => ({
  height: theme.spacing(AVATAR_SIZE),
  width: theme.spacing(AVATAR_SIZE),
  marginRight: theme.spacing(2),
}));

interface DiscussionCommentProps {
  comment: Comment;
  canDelete: boolean;
  onDelete?: (discussionId: string, msgId?: string) => Promise<void> | void;
  isRootComment?: boolean;
}

export const DiscussionComment: FC<DiscussionCommentProps> = ({ comment, canDelete, onDelete, isRootComment }) => {
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
          <UserAvatar src={author?.avatarUrl} variant="rounded">
            {author?.displayName[0]}
          </UserAvatar>
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
      <CommentBox>
        <Markdown>{body}</Markdown>
      </CommentBox>
    </Box>
  );
};
export default DiscussionComment;
