import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CommentInput } from '@/crd/components/comment/CommentInput';
import type { CommentAuthor } from '@/crd/components/comment/types';
import { ChatMessageBubble } from './ChatMessageBubble';
import type { ChatMessage, ChatThreadHeader } from './types';

type ChatThreadViewProps = {
  conversation?: ChatThreadHeader;
  messages: ChatMessage[];
  messagesLoading: boolean;
  currentUser?: CommentAuthor;
  isSending?: boolean;
  canReact?: boolean;
  /** Guidance only: the assistant is generating a reply — show a loader, disable input. */
  isAwaitingGuidanceResponse?: boolean;
  onSendMessage?: (content: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
};

/**
 * The message thread for a selected conversation. The back affordance and the
 * conversation title live in the panel header; this view owns the scrollable
 * message list and the composer. Auto-scrolls to the latest message.
 */
export function ChatThreadView({
  conversation,
  messages,
  messagesLoading,
  currentUser,
  isSending,
  canReact,
  isAwaitingGuidanceResponse,
  onSendMessage,
  onAddReaction,
  onRemoveReaction,
}: ChatThreadViewProps) {
  const { t } = useTranslation('crd-chat');
  const bottomRef = useRef<HTMLDivElement>(null);

  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

  // Keep the latest message in view as the thread loads / receives messages.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lastMessageId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
        {messagesLoading && messages.length === 0 ? (
          <output className="m-auto text-caption text-muted-foreground" aria-label={t('thread.loading')}>
            {t('thread.loading')}
          </output>
        ) : (
          messages.map(message => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              showAuthor={conversation?.isGroup}
              canReact={canReact}
              onAddReaction={onAddReaction ? emoji => onAddReaction(message.id, emoji) : undefined}
              onRemoveReaction={onRemoveReaction ? emoji => onRemoveReaction(message.id, emoji) : undefined}
            />
          ))
        )}
        {isAwaitingGuidanceResponse && (
          <output
            className="flex items-center gap-2 self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-caption text-muted-foreground"
            aria-label={t('guidance.thinking')}
          >
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            {t('guidance.thinking')}
          </output>
        )}
        <div ref={bottomRef} />
      </div>
      {onSendMessage && (
        <div className="shrink-0 border-t border-border p-2">
          <CommentInput
            currentUser={currentUser}
            onSubmit={onSendMessage}
            disabled={isSending || isAwaitingGuidanceResponse}
          />
        </div>
      )}
    </div>
  );
}
