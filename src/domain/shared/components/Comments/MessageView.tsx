import React, { FC, useMemo } from 'react';
import { DeleteOutlined } from '@mui/icons-material';
import { Box, Typography, styled, BoxProps, IconButton, Grid } from '@mui/material';
import { Message } from './models/message';
import WrapperMarkdown from '../../../../common/components/core/WrapperMarkdown';
import { formatTimeElapsed } from '../../utils/formatTimeElapsed';
import AuthorAvatar from '../AuthorAvatar/AuthorAvatar';
import { Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';

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

  const authorLabel = useMemo(
    () => (author?.roleName ? `${author?.displayName} • ${author?.roleName}` : author?.displayName),
    [author?.displayName, author?.roleName]
  );

  return (
    <Box display="flex" gap={gutters(0.5)}>
      <AuthorAvatar author={author} />
      <Box
        flexGrow={1}
        flexShrink={1}
        minWidth={0}
        padding={1}
        display="flex"
        alignItems="top"
        justifyContent="space-between"
        bgcolor={isRootComment ? 'background.paper' : 'neutralMedium.light'}
        borderRadius={theme => theme.shape.borderRadius}
      >
        <Grid container direction="column">
          <Grid item>
            <Grid container spacing={1}>
              <Grid item xs>
                <Caption>{authorLabel}</Caption>
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
    </Box>
  );
};

export default MessageView;
