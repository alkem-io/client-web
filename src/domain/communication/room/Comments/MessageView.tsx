import { PropsWithChildren, ReactNode } from 'react';
import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, IconButton, styled, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import AuthorAvatar from '@/domain/shared/components/AuthorAvatar/AuthorAvatar';
import { Caption, Text } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import CommentReactions from './CommentReactions';
import { MaybeDeletedMessage } from './useRestoredMessages';
import { ProfileType } from '@/core/apollo/generated/graphql-schema';
import VirtualContributorLabel from '@/domain/community/virtualContributor/VirtualContributorLabel';

const MessageContentWrapper = styled(Box)(({ theme }) => ({
  overflowWrap: 'break-word',
  paddingX: theme.spacing(1),
  '& > p:last-child': { marginBottom: 0 },
  '& a': { textDecoration: 'none', color: theme.palette.primary.main },
  '& a:hover': { color: theme.palette.primary.light },
}));

const MessageActionsContainer = styled('ul')(({ theme }) => ({
  display: 'flex',
  margin: 0,
  marginLeft: theme.spacing(1),
  padding: 0,
  minHeight: gutters()(theme),
  '& > li': {
    listStyleType: 'none',
    display: 'flex',
    alignItems: 'center',
    '&:not(:first-of-type):before': {
      content: '""',
      width: theme.spacing(0.1),
      marginLeft: theme.spacing(0.4),
      marginRight: theme.spacing(0.5),
      height: '1em',
      backgroundColor: theme.palette.text.secondary,
    },
  },
}));

export interface MessageViewProps {
  message: MaybeDeletedMessage;
  canDelete: boolean;
  onDelete?: (discussionId: string, msgId?: string) => Promise<void> | void;
  canUpdate?: boolean;
  onUpdate?: (discussionId: string, msgId?: string) => Promise<void> | void;
  root?: boolean;
  actions?: ReactNode;
  canAddReaction?: boolean;
  addReaction?: (reaction: { emoji: string; messageId: string }) => void;
  removeReaction?: (reactionId: string, messageId: string) => void;
}

export const MessageView = ({
  message,
  canDelete,
  onDelete,
  canUpdate,
  onUpdate,
  root = false,
  actions,
  canAddReaction = true,
  addReaction,
  removeReaction,
  children,
}: PropsWithChildren<MessageViewProps>) => {
  const { author, id } = message;

  const { t } = useTranslation();
  const theme = useTheme();

  const enabledReactions = addReaction && removeReaction;
  const handleAddReaction = (emoji: string) => addReaction?.({ emoji, messageId: message.id });
  const handleRemoveReaction = (reactionId: string) => removeReaction?.(reactionId, message.id);

  return (
    <Box display="flex" gap={gutters(0.5)}>
      <AuthorAvatar author={author} />
      <Box flexGrow={1} flexShrink={1} minWidth={0}>
        <Box
          sx={{
            backgroundColor: root ? undefined : 'background.default',
            padding: gutters(0.5),
            borderRadius: theme => `${theme.shape.borderRadius}px`,
          }}
        >
          {!message.deleted && (
            <Box display="flex" height={gutters()} justifyContent="space-between" alignItems="center">
              <Caption>{author?.displayName || t('messaging.missingAuthor')}</Caption>
              {author?.type === ProfileType.VirtualContributor && <VirtualContributorLabel />}
              <Box display="flex" height={gutters()} justifyContent="end" alignItems="center">
                {!message.deleted && (
                  <Box display="flex" justifyContent="end">
                    <Typography variant="body2" color="neutralMedium.dark">
                      {formatTimeElapsed(message.createdAt, t)}
                    </Typography>
                  </Box>
                )}
                {root && canUpdate && onUpdate && (
                  <IconButton onClick={() => onUpdate(id)} size="small" aria-label={t('common.update')}>
                    <EditOutlined fontSize="inherit" />
                  </IconButton>
                )}
                {canDelete && onDelete && (
                  <IconButton onClick={() => onDelete(id)} size="small" aria-label={t('buttons.delete')}>
                    <DeleteOutlined fontSize="inherit" />
                  </IconButton>
                )}
              </Box>
            </Box>
          )}
          <MessageContentWrapper>
            {message.deleted ? (
              <Text fontStyle="italic" paddingY={gutters(0.5)}>
                {t('messaging.messageDeleted')}
              </Text>
            ) : (
              <WrapperMarkdown sx={{ '& p': { marginTop: gutters(0.2)(theme), marginBottom: gutters(0.2)(theme) } }}>
                {message.message}
              </WrapperMarkdown>
            )}
          </MessageContentWrapper>
        </Box>
        <MessageActionsContainer>
          {enabledReactions && (
            <Box component="li">
              <CommentReactions
                reactions={message.reactions}
                canAddReaction={canAddReaction}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
              />
            </Box>
          )}
          {actions}
        </MessageActionsContainer>
        {children}
      </Box>
    </Box>
  );
};

export default MessageView;
