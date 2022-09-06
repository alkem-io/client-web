import React, { FC, useMemo } from 'react';
import { DeleteOutlined } from '@mui/icons-material';
import { Avatar, Box, Typography, styled, AvatarProps, BoxProps, IconButton, Grid, Tooltip, Link } from '@mui/material';
import { Comment } from '../../../../../models/discussion/comment';
import Markdown from '../../../core/Markdown';
import { formatCommentDate } from './formatCommentDate';
import UserCard from '../cards/user-card/UserCard';

const CommentBox = styled(props => <Box {...props} />)<BoxProps>(({ theme }) => ({
  overflowWrap: 'break-word',
  paddingX: theme.spacing(1),
  '& > p:first-child': { marginTop: 0 },
  '& > p:last-child': { marginBottom: 0 },
}));

const UserAvatar = styled(props => <Avatar {...props} />)<AvatarProps>(({ theme }) => ({
  height: theme.spacing(theme.comments.avatarSize),
  width: theme.spacing(theme.comments.avatarSize),
}));

interface DiscussionCommentProps {
  comment: Comment;
  canDelete: boolean;
  onDelete?: (discussionId: string, msgId?: string) => Promise<void> | void;
  isRootComment?: boolean;
}

export const DiscussionComment: FC<DiscussionCommentProps> = ({ comment, canDelete, onDelete, isRootComment }) => {
  const { author, body, id } = comment;
  const TooltipElement = useMemo(
    () =>
      ({ children }) =>
        author ? (
          <Tooltip
            arrow
            title={
              <UserCard
                displayName={author?.displayName}
                avatarSrc={author?.avatarUrl}
                tags={author?.tags || []}
                roleName={author?.roleName}
                city={author?.city}
                country={author?.country}
                url={author?.url}
              />
            }
            PopperProps={{
              sx: { '& > *': { background: 'transparent' } },
            }}
          >
            {children}
          </Tooltip>
        ) : (
          <>{children}</>
        ),
    [author]
  );

  return (
    <Grid container spacing={1.5}>
      <Grid item>
        <TooltipElement>
          <Link href={author?.url}>
            <UserAvatar src={author?.avatarUrl} variant="rounded" sx={{ borderRadius: 1.5 }}>
              {author?.displayName[0]}
            </UserAvatar>
          </Link>
        </TooltipElement>
      </Grid>
      <Grid item xs zeroMinWidth>
        <Box
          padding={1}
          display="flex"
          alignItems="top"
          justifyContent="space-between"
          bgcolor={isRootComment ? 'background.paper' : 'neutralMedium.light'}
          borderRadius={1.5}
          marginRight={1}
        >
          <Grid container direction="column">
            <Grid item>
              <Grid container spacing={1}>
                <Grid item>
                  <Typography variant="h6" fontWeight={600}>
                    {author?.displayName}
                  </Typography>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6" color="neutralMedium.dark" sx={{ fontStyle: 'italic' }}>
                    {author?.roleName}
                  </Typography>
                </Grid>
                <Grid item>
                  {canDelete && onDelete && (
                    <IconButton aria-label="Delete" onClick={() => onDelete(id)} size={'small'}>
                      <DeleteOutlined />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item zeroMinWidth>
                <Box>
                  <CommentBox>
                    <Markdown>{body}</Markdown>
                  </CommentBox>
                </Box>
              </Grid>
            </Grid>
            <Grid item>
              <Box display="flex" justifyContent="flex-end">
                <Typography variant="body2" color="neutralMedium.dark">
                  {`${isRootComment ? 'started the discussion ' : ' '}${formatCommentDate(comment.createdAt)}`}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};
export default DiscussionComment;
