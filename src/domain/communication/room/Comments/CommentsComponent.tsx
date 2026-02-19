import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FetchResult } from '@apollo/client';
import { Message } from '../models/Message';
import PostMessageToCommentsForm from './PostMessageToCommentsForm';
import Gutters from '@/core/ui/grid/Gutters';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import useCommentReactionsMutations from './useCommentReactionsMutations';
import MessagesThread from './MessagesThread';
import { CommentInputFieldProps } from './CommentInputField';
import CalloutClosedMarginal from '@/domain/collaboration/callout/calloutBlock/CalloutClosedMarginal';
import { Box, ButtonBase, Typography } from '@mui/material';

const DEFAULT_COLLAPSED_HEIGHT = 250;

export interface CommentsComponentProps {
  messages: Message[] | undefined;
  vcInteractions: CommentInputFieldProps['vcInteractions'];
  commentsId: string | undefined;
  canReadMessages: boolean;
  canPostMessages: boolean;
  isMember?: boolean;
  canAddReaction: boolean;
  canDeleteMessage: (authorId: string | undefined) => boolean;
  postMessage: (message: string) => Promise<FetchResult<unknown>>;
  postReply: (reply: { messageText: string; threadId: string }) => Promise<FetchResult<unknown>>;
  handleDeleteMessage: (commentsId: string, messageId: string) => void;
  loading?: boolean;
  commentsEnabled: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  collapsedHeight?: number;
}

const CommentsComponent = ({
  messages = [],
  vcInteractions = [],
  commentsId,
  postMessage,
  postReply,
  handleDeleteMessage,
  canPostMessages,
  isMember = false,
  canDeleteMessage,
  canAddReaction,
  loading,
  commentsEnabled,
  collapsed,
  onToggleCollapse,
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
}: CommentsComponentProps) => {
  const { t } = useTranslation();

  const [commentToBeDeleted, setCommentToBeDeleted] = useState<string | undefined>(undefined);

  const handleDeleteComment = (id: string) => (commentsId ? handleDeleteMessage(commentsId, id) : undefined);
  const onDeleteComment = (id: string) => setCommentToBeDeleted(id);

  const handlePostComment = async (comment: string) => {
    return await postMessage(comment);
  };

  const handlePostReply = async (reply: { threadId: string; messageText: string }) => {
    return await postReply(reply);
  };

  const commentReactionsMutations = useCommentReactionsMutations(commentsId);

  const hasMessages = messages.length > 0;

  return (
    <>
      {canPostMessages && (
        <PostMessageToCommentsForm
          placeholder={t('pages.post.dashboard.comment.placeholder')}
          onPostComment={handlePostComment}
          disabled={loading}
          paddingTop={0}
        />
      )}
      {!canPostMessages && (
        <CalloutClosedMarginal messagesCount={messages?.length ?? 0} disabled={!commentsEnabled} isMember={isMember} />
      )}
      {hasMessages && (
        <Box position="relative">
          <Box
            sx={{
              ...(collapsed
                ? {
                    maxHeight: collapsedHeight,
                    overflow: 'hidden',
                  }
                : {}),
            }}
          >
            <Gutters disableSidePadding gap={0}>
              <MessagesThread
                messages={messages}
                vcInteractions={vcInteractions}
                canPostMessages={canPostMessages}
                onReply={handlePostReply}
                canDeleteMessage={canDeleteMessage}
                onDeleteMessage={onDeleteComment}
                canAddReaction={canAddReaction}
                loading={loading}
                {...commentReactionsMutations}
              />
            </Gutters>
          </Box>
          {collapsed && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                background: theme => `linear-gradient(transparent, ${theme.palette.background.paper})`,
                pointerEvents: 'none',
              }}
            />
          )}
        </Box>
      )}
      {hasMessages && onToggleCollapse && (
        <ButtonBase onClick={onToggleCollapse} sx={{ justifyContent: 'flex-start', paddingY: 1 }}>
          <Typography variant="caption" color="primary">
            {collapsed ? t('comments.expandAll', { count: messages.length }) : t('comments.collapse')}
          </Typography>
        </ButtonBase>
      )}
      <ConfirmationDialog
        actions={{
          onCancel: () => setCommentToBeDeleted(undefined),
          onConfirm: async () => {
            if (commentToBeDeleted) {
              await handleDeleteComment(commentToBeDeleted);
            }
            setCommentToBeDeleted(undefined);
          },
        }}
        entities={{
          confirmButtonTextId: 'buttons.delete',
          contentId: 'components.confirmation-dialog.delete-comment.confirmation-text',
          titleId: 'components.confirmation-dialog.delete-comment.confirmation-title',
        }}
        options={{
          show: Boolean(commentToBeDeleted),
        }}
      />
    </>
  );
};

export default CommentsComponent;
