import { Loader2 } from 'lucide-react';
import { type PointerEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommentInput } from '@/crd/components/comment/CommentInput';
import type { MessageMediaDownload } from '@/crd/components/comment/MessageAttachments';
import type { CommentAuthor, ComposerAttachment } from '@/crd/components/comment/types';
import { cn } from '@/crd/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';
import { ChatMessageBubble } from './ChatMessageBubble';
import { createChatTimeFormat } from './chatTime';
import { computeMessageRunFlags } from './messageRuns';
import type { ChatMessage, ChatThreadHeader } from './types';

type ChatThreadViewProps = {
  conversation?: ChatThreadHeader;
  messages: ChatMessage[];
  messagesLoading: boolean;
  /** BCP 47 locale for the times shown in the thread; undefined = browser default. */
  locale?: string;
  currentUser?: CommentAuthor;
  isSending?: boolean;
  canReact?: boolean;
  /** Guidance only: the assistant is generating a reply — show a loader, disable input. */
  isAwaitingGuidanceResponse?: boolean;
  /**
   * Composer text, owned by the consumer so an unsent draft outlives this view.
   * Omit both to let the composer keep its own text (preview surfaces).
   */
  draft?: string;
  onDraftChange?: (value: string) => void;
  onSendMessage?: (content: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  /** Attachments (feature 013): when enabled the composer shows the attach
   *  affordance + preview chips. Owned by the integration layer. */
  attachmentsEnabled?: boolean;
  attachments?: ComposerAttachment[];
  onAttachFiles?: (files: File[]) => void;
  onRemoveAttachment?: (id: string) => void;
  attachmentError?: string;
  acceptMimeTypes?: string;
  /** Downloads an image/video from the in-page media viewer. */
  onDownloadMedia?: (media: MessageMediaDownload) => void;
};

/**
 * The message thread for a selected conversation. The back affordance and the
 * conversation title live in the panel header; this view owns the scrollable
 * message list and the composer. Auto-scrolls to the latest message.
 *
 * Time is shown only where it tells the reader something: a separator opens
 * each day with the time its conversation started, and a small time marks
 * where the conversation continues after an hour of quiet. A single message's
 * exact time is in a tooltip on hover or keyboard focus, opens under the
 * message on a tap (touch has no hover), and is always there for screen readers.
 */
export function ChatThreadView({
  conversation,
  messages,
  messagesLoading,
  locale,
  currentUser,
  isSending,
  canReact,
  isAwaitingGuidanceResponse,
  draft,
  onDraftChange,
  onSendMessage,
  onAddReaction,
  onRemoveReaction,
  attachmentsEnabled,
  attachments,
  onAttachFiles,
  onRemoveAttachment,
  attachmentError,
  acceptMimeTypes,
  onDownloadMedia,
}: ChatThreadViewProps) {
  const { t } = useTranslation('crd-chat');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [revealedIds, setRevealedIds] = useState<ReadonlySet<string>>(() => new Set());

  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
  const runFlags = computeMessageRunFlags(messages, conversation?.isGroup ?? false);
  const time = createChatTimeFormat(locale);

  // A tap (any pointer that cannot hover) toggles the message's time open and
  // closed. Taps on the message's own controls — reactions, links, media — pass.
  const toggleRevealedOnTap = (id: string) => (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    // React bubbles events from portalled popovers (the emoji picker) through the
    // message; only a tap on the message itself toggles it.
    if (!event.currentTarget.contains(event.target as Node)) return;
    if ((event.target as HTMLElement).closest('button, a')) return;
    setRevealedIds(previous => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  };

  // Keep the latest message in view as the thread loads / receives messages.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [lastMessageId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 pt-1 pb-3">
        {messagesLoading && messages.length === 0 ? (
          <output className="m-auto text-caption text-muted-foreground" aria-label={t('thread.loading')}>
            {t('thread.loading')}
          </output>
        ) : (
          messages.map((message, index) => {
            const flags = runFlags[index];
            const ms = message.timestampMs;
            const hasTime = ms > 0;
            const isRevealed = hasTime && revealedIds.has(message.id);
            const isFirstOfGroup = flags.groupPosition === 'single' || flags.groupPosition === 'first';
            const bubble = (
              <ChatMessageBubble
                message={message}
                showAuthor={flags.showAuthor}
                showAvatar={flags.showAvatar}
                avatarGutter={flags.avatarGutter}
                groupPosition={flags.groupPosition}
                revealed={isRevealed}
                canReact={canReact}
                onAddReaction={onAddReaction ? emoji => onAddReaction(message.id, emoji) : undefined}
                onRemoveReaction={onRemoveReaction ? emoji => onRemoveReaction(message.id, emoji) : undefined}
                onDownloadMedia={onDownloadMedia}
              />
            );
            return (
              <div key={message.id} className="flex flex-col">
                {flags.dayStart && (
                  <div
                    data-testid="chat-day-separator"
                    className="mt-3 mb-1 self-center rounded-full bg-muted px-2.5 py-0.5 text-caption text-muted-foreground"
                  >
                    {time.day(ms)} {time.clock(ms)}
                  </div>
                )}
                {flags.afterPause && (
                  <div data-testid="chat-pause-time" className="mt-3 self-center text-caption text-muted-foreground">
                    {time.clock(ms)}
                  </div>
                )}
                {hasTime ? (
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild={true}>
                      <div
                        data-chat-message={true}
                        // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard focus is how the exact time is reached without hover
                        tabIndex={0}
                        onPointerUp={toggleRevealedOnTap(message.id)}
                        className={cn(
                          'flex flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isFirstOfGroup ? 'mt-3' : 'mt-0.5'
                        )}
                      >
                        <span className="sr-only">{time.exact(ms)}</span>
                        {bubble}
                        {isRevealed && (
                          <span
                            data-testid="chat-revealed-time"
                            aria-hidden="true"
                            className={cn(
                              'px-1 pt-0.5 text-caption text-muted-foreground',
                              message.isOwn ? 'self-end' : 'self-start',
                              flags.avatarGutter && 'pl-11'
                            )}
                          >
                            {time.exact(ms)}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align={message.isOwn ? 'end' : 'start'}
                      // Line up with the bubble rather than the avatar gutter.
                      alignOffset={flags.avatarGutter ? 40 : 0}
                    >
                      {time.exact(ms)}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div data-chat-message={true} className={cn('flex flex-col', isFirstOfGroup ? 'mt-3' : 'mt-0.5')}>
                    {bubble}
                  </div>
                )}
              </div>
            );
          })
        )}
        {isAwaitingGuidanceResponse && (
          <output
            className="mt-3 flex items-center gap-2 self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-caption text-muted-foreground"
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
            refocusAfterSubmit={true}
            value={draft}
            onValueChange={onDraftChange}
            attachmentsEnabled={attachmentsEnabled}
            attachments={attachments}
            onAttachFiles={onAttachFiles}
            onRemoveAttachment={onRemoveAttachment}
            attachmentError={attachmentError}
            acceptMimeTypes={acceptMimeTypes}
          />
        </div>
      )}
    </div>
  );
}
