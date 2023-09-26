import React from 'react';
import PostMessageToCommentsForm from './PostMessageToCommentsForm';
import MessageView, { MessageViewProps } from './MessageView';
import MessageWithRepliesView from './MessageWithRepliesView';
import { Message } from '../models/Message';
import { useTranslation } from 'react-i18next';
import useMessagesTree from './useMessagesTree';
import useRestoredMessages from './useRestoredMessages';

interface MessagesThreadProps {
  messages: Message[] | undefined;
  loading?: boolean;
  canPostMessages: boolean;
  onReply: (reply: { threadId: string; messageText: string }) => void;
  canDeleteMessage: (authorId: string | undefined) => boolean;
  onDeleteMessage: MessageViewProps['onDelete'];
  canAddReaction: MessageViewProps['canAddReaction'];
  addReaction: MessageViewProps['addReaction'];
  removeReaction: MessageViewProps['removeReaction'];
}

const MessagesThread = ({
  messages,
  loading,
  canPostMessages,
  onReply,
  canDeleteMessage,
  onDeleteMessage,
  canAddReaction,
  addReaction,
  removeReaction,
}: MessagesThreadProps) => {
  const { t } = useTranslation();

  const messagesWithRestored = useRestoredMessages(messages);

  const rootMessages = useMessagesTree(messagesWithRestored);

  return (
    <>
      {rootMessages?.map(message => (
        <MessageWithRepliesView
          key={message.id}
          message={message}
          canDelete={!message.deleted && canDeleteMessage(message.author?.id)}
          onDelete={onDeleteMessage}
          canAddReaction={canAddReaction && !message.deleted}
          addReaction={addReaction}
          removeReaction={removeReaction}
          reply={
            canPostMessages &&
            !message.deleted && (
              <PostMessageToCommentsForm
                placeholder={t('pages.post.dashboard.comment.placeholder')}
                onPostComment={(messageText: string) =>
                  message &&
                  onReply({
                    threadId: message.id,
                    messageText,
                  })
                }
                disabled={loading}
              />
            )
          }
        >
          {message.replies?.map(message => (
            <MessageView
              key={message.id}
              message={message}
              canDelete={canDeleteMessage(message.author?.id)}
              onDelete={onDeleteMessage}
              canAddReaction={canAddReaction}
              addReaction={addReaction}
              removeReaction={removeReaction}
            />
          ))}
        </MessageWithRepliesView>
      ))}
    </>
  );
};

export default MessagesThread;
