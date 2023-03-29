import React, { FC } from 'react';
import { DeleteOutlined } from '@mui/icons-material';
import { Box, BoxProps, Grid, IconButton, styled, Typography } from '@mui/material';
import { Message } from './models/message';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { formatTimeElapsed } from '../../utils/formatTimeElapsed';
import AuthorAvatar from '../AuthorAvatar/AuthorAvatar';
import { Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';

const CommentBox = styled(props => <Box {...props} />)<BoxProps>(({ theme }) => ({
  overflowWrap: 'break-word',
  paddingX: theme.spacing(1),
  '& > p:first-of-type': { marginTop: 0 },
  '& > p:last-child': { marginBottom: 0 },
  '& a': { textDecoration: 'none', color: theme.palette.primary.main },
  '& a:hover': { color: theme.palette.primary.light },
}));

const CommentWrapper = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  padding: gutters(0.5)(theme),
  display: 'flex',
  alignItems: 'top',
  justifyContent: 'space-between',
  borderRadius: theme.shape.borderRadius,
}));

interface MessageViewProps {
  message: Message;
  canDelete: boolean;
  onDelete?: (discussionId: string, msgId?: string) => Promise<void> | void;
  isRootComment?: boolean;
}

export const MessageView: FC<MessageViewProps> = ({ message, canDelete, onDelete, isRootComment }) => {
  const { author, body, id } = message;

  return (
    <Box display="flex" gap={gutters(0.5)}>
      <AuthorAvatar author={author} />
      <CommentWrapper bgcolor={isRootComment ? 'background.paper' : 'neutralMedium.light'}>
        <Grid container direction="column">
          <Grid item>
            <Grid container spacing={1}>
              <Grid item xs>
                <Caption>{author?.displayName}</Caption>
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
                  <WrapperMarkdown>{body}</WrapperMarkdown>
                </CommentBox>
              </Box>
            </Grid>
          </Grid>
          <Grid item>
            <Box display="flex" justifyContent="flex-end">
              <Typography variant="body2" color="neutralMedium.dark">
                {`${isRootComment ? 'started the discussion ' : ' '}${formatTimeElapsed(message.createdAt)}`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CommentWrapper>
    </Box>
  );
};

export default MessageView;
