import React, { FC } from 'react';
import { DeleteOutlined } from '@mui/icons-material';
import { Box, Typography, styled, BoxProps, IconButton, Grid } from '@mui/material';
import { Message } from './models/message';
import WrapperMarkdown from '../../../../common/components/core/WrapperMarkdown';
import { formatTimeElapsed } from '../../utils/formatTimeElapsed';
import AuthorAvatar from '../AuthorAvatar/AuthorAvatar';

const CommentBox = styled(props => <Box {...props} />)<BoxProps>(({ theme }) => ({
  overflowWrap: 'break-word',
  paddingX: theme.spacing(1),
  '& > p:first-of-type': { marginTop: 0 },
  '& > p:last-child': { marginBottom: 0 },
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
    <Grid container spacing={1.5}>
      <Grid item>
        <AuthorAvatar author={author} />
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
        </Box>
      </Grid>
    </Grid>
  );
};
export default MessageView;
