import { Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CommentReactions } from '@/crd/components/comment/CommentReactions';
import { EmojiPicker } from '@/crd/components/common/EmojiPicker';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { VirtualContributorBadge } from '@/crd/components/common/VirtualContributorBadge';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { initials } from './initials';
import type { ChatMessage } from './types';

type ChatMessageBubbleProps = {
  message: ChatMessage;
  /** Show the author name above the bubble — true only for the first message of a run. */
  showAuthor?: boolean;
  /** Render the sender's avatar in the left gutter — true only for the first message of a run. */
  showAvatar?: boolean;
  /** Reserve the left avatar gutter (group conversations only — indents run continuations). */
  avatarGutter?: boolean;
  canReact?: boolean;
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
};

/**
 * A single chat message: own messages align right, others left. Reuses the
 * markdown renderer, the VC badge, and the comment reaction pills + emoji picker.
 *
 * When `avatarGutter` is falsy the rendered DOM is byte-identical to before
 * this component grew group-thread run-grouping (contract I7 — own messages,
 * 1:1, Guidance are never given a gutter).
 */
export function ChatMessageBubble({
  message,
  showAuthor,
  showAvatar,
  avatarGutter,
  canReact = false,
  onAddReaction,
  onRemoveReaction,
}: ChatMessageBubbleProps) {
  const { t } = useTranslation('crd-chat');
  const { isOwn, author } = message;
  // No reactions on optimistic/pending messages or the synthetic guidance intro (FR-016a).
  const effectiveCanReact = canReact && !message.isPending;

  const bubbleColumn = (
    <div className={cn('group flex flex-col gap-0.5', isOwn ? 'items-end' : 'items-start')}>
      {showAuthor && !isOwn && author && (
        <span className="flex items-center gap-1 px-1 text-caption text-muted-foreground">
          <span className="truncate">{author.name}</span>
          {author.isVirtualContributor && <VirtualContributorBadge />}
        </span>
      )}
      {/* Run continuation: the name is visually omitted but sender attribution must
          still reach assistive technology (FR-008). No new i18n key — author.name is
          business data, not UI copy (FR-016). */}
      {avatarGutter && !showAuthor && !isOwn && author && <span className="sr-only">{author.name}</span>}
      <div className={cn('flex items-center gap-1', isOwn && 'flex-row-reverse')}>
        <div
          className={cn(
            'max-w-[85%] rounded-2xl px-3 py-2',
            isOwn ? 'rounded-br-sm bg-primary/15' : 'rounded-bl-sm bg-muted',
            message.isPending && 'opacity-60'
          )}
        >
          <MarkdownContent
            content={message.content}
            className="text-body [&_p]:mb-1 [&_p]:text-foreground [&_p:last-child]:mb-0"
          />
        </div>
        {effectiveCanReact && onAddReaction && (
          <EmojiPicker
            onSelect={onAddReaction}
            trigger={
              <button
                type="button"
                aria-label={t('thread.addReaction')}
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
              >
                <Smile aria-hidden="true" className="size-4" />
              </button>
            }
          />
        )}
      </div>
      {message.reactions.length > 0 && (
        <CommentReactions
          reactions={message.reactions}
          canReact={effectiveCanReact}
          onAdd={emoji => onAddReaction?.(emoji)}
          onRemove={emoji => onRemoveReaction?.(emoji)}
        />
      )}
      {message.timestamp && <span className="px-1 text-caption text-muted-foreground">{message.timestamp}</span>}
    </div>
  );

  if (!avatarGutter || isOwn) {
    return bubbleColumn;
  }

  return (
    <div className="flex items-start gap-2">
      <div className="flex w-8 shrink-0 justify-center">
        {showAvatar && author ? (
          <Avatar className="size-8" aria-hidden="true">
            {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt="" />}
            <AvatarFallback className="text-caption">{initials(author.name)}</AvatarFallback>
          </Avatar>
        ) : null}
      </div>
      {bubbleColumn}
    </div>
  );
}
