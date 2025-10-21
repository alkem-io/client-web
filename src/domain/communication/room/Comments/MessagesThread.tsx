import PostMessageToCommentsForm, { PostMessageToCommentsFormProps } from './PostMessageToCommentsForm';
import MessageView, { MessageViewProps } from './MessageView';
import MessageWithRepliesView from './MessageWithRepliesView';
import { Message } from '../models/Message';
import { useTranslation } from 'react-i18next';
import useMessagesTree from './useMessagesTree';
import useRestoredMessages from './useRestoredMessages';

export interface MessagesThreadProps {
  messages: Message[] | undefined;
  vcInteractions?: PostMessageToCommentsFormProps['vcInteractions'];
  vcEnabled?: boolean;
  loading?: boolean;
  canPostMessages: boolean;
  onReply: (reply: { threadId: string; messageText: string }, responseBoxElement: HTMLDivElement | null) => void;
  canDeleteMessage: (authorId: string | undefined) => boolean;
  onDeleteMessage: MessageViewProps['onDelete'];
  canAddReaction: MessageViewProps['canAddReaction'];
  addReaction: MessageViewProps['addReaction'];
  removeReaction: MessageViewProps['removeReaction'];
}

const MessagesThread = ({
  messages,
  vcInteractions = [],
  vcEnabled = true,
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
          canReply={canPostMessages}
          canAddReaction={canAddReaction && !message.deleted}
          addReaction={addReaction}
          removeReaction={removeReaction}
          reply={
            canPostMessages &&
            !message.deleted && (
              <PostMessageToCommentsForm
                vcInteractions={vcInteractions}
                vcEnabled={vcEnabled}
                threadId={message.id}
                placeholder={t('pages.post.dashboard.comment.placeholder')}
                onPostComment={(messageText, responseBoxElement) =>
                  message &&
                  onReply(
                    {
                      threadId: message.id,
                      messageText,
                    },
                    responseBoxElement
                  )
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
