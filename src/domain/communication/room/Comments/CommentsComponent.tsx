import type { FetchResult } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import Gutters from '@/core/ui/grid/Gutters';
import CalloutClosedMarginal from '@/domain/collaboration/callout/calloutBlock/CalloutClosedMarginal';
import type { Message } from '../models/Message';
import CollapsibleCommentsThread from './CollapsibleCommentsThread';
import type { CommentInputFieldProps } from './CommentInputField';
import MessagesThread from './MessagesThread';
import PostMessageToCommentsForm from './PostMessageToCommentsForm';
import useCommentReactionsMutations from './useCommentReactionsMutations';

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
  collapsedHeight,
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
        <CollapsibleCommentsThread
          itemCount={messages.length}
          collapsed={Boolean(collapsed)}
          onToggleCollapse={onToggleCollapse}
          collapsedHeight={collapsedHeight}
          id={commentsId ? `comments-thread-${commentsId}` : undefined}
        >
          <Gutters disableSidePadding={true} gap={0}>
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
        </CollapsibleCommentsThread>
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
