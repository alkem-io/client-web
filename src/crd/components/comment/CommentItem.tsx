import { Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmojiPicker } from '@/crd/components/common/EmojiPicker';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { VirtualContributorBadge } from '@/crd/components/common/VirtualContributorBadge';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { CommentReactions } from './CommentReactions';
import type { CommentData } from './types';

type CommentItemProps = {
  comment: CommentData;
  onDelete: (commentId: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
  isReply?: boolean;
  /** Whether the viewer can post / reply / react. When false the Reply
   *  button and the add-reaction picker are hidden, and the reaction pills
   *  become non-interactive (still visible). */
  canComment?: boolean;
  /** True when this comment's Reply button has been toggled on. Drives the
   *  Reply button's aria-expanded state — the reply input itself is rendered
   *  by the parent CommentThread (positioned at the END of the reply group
   *  so it visually matches where the new reply will land). */
  isReplyOpen?: boolean;
  /** Toggle the thread's reply input. Passed to the root comment (renders a
   *  "Reply" button before Delete) and to the LAST reply in the thread
   *  (renders a "Reply in this thread" button after Delete) — both open the
   *  same input. Omitted for deleted comments, mid-thread replies, and when
   *  the viewer can't comment. */
  onToggleReply?: () => void;
  /** Stable id used for `aria-controls` on the reply button — the parent
   *  thread uses the same id on the input container so the relationship is
   *  exposed to assistive tech even though the input renders elsewhere. */
  replyInputId?: string;
};

export function CommentItem({
  comment,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  isReply,
  canComment = true,
  isReplyOpen = false,
  onToggleReply,
  replyInputId,
}: CommentItemProps) {
  const { t } = useTranslation('crd-space');

  // Guard against duplicate reactions. The legacy MUI picker silently no-ops
  // when the user picks an emoji they already reacted with; the backend
  // otherwise throws. Users still toggle off by clicking the existing pill.
  const handleAddReaction = (emoji: string) => {
    const alreadyReacted = comment.reactions.some(reaction => reaction.emoji === emoji && reaction.hasReacted);
    if (alreadyReacted) return;
    onAddReaction(comment.id, emoji);
  };

  // Long or multi-line comments stretch to the full column so the text has
  // room to breathe; short single-line comments keep the chat-bubble shape
  // so the hover toolbar stays next to the text.
  const isLongComment = comment.content.length > 120 || comment.content.includes('\n');

  return (
    <div className={cn('group/comment space-y-1.5', isReply && 'ml-6 md:ml-10')}>
      <div className="flex gap-3">
        {comment.author.profileUrl ? (
          <a
            href={comment.author.profileUrl}
            onClick={e => e.stopPropagation()}
            aria-label={comment.author.name}
            className="relative z-10 block shrink-0 self-start rounded-full -m-0.5 p-0.5 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="h-8 w-8">
              {comment.author.avatarUrl && <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />}
              <AvatarFallback className="text-caption">{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </a>
        ) : (
          <Avatar className="h-8 w-8 shrink-0">
            {comment.author.avatarUrl && <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />}
            <AvatarFallback className="text-caption">{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className={cn(isLongComment ? 'w-full' : 'w-fit max-w-[min(460px,100%)]')}>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-body-emphasis text-foreground">{comment.author.name}</span>
                {comment.author.isVirtualContributor && <VirtualContributorBadge />}
                <span className="text-caption text-muted-foreground">{comment.timestamp}</span>
              </div>

              {comment.isDeleted ? (
                <p className="text-body italic text-muted-foreground">{t('comments.deleted')}</p>
              ) : (
                <MarkdownContent
                  content={comment.content}
                  className="break-words text-body text-foreground [&_p]:mb-0 [&_p]:leading-normal [&_p]:text-foreground"
                />
              )}
            </div>
          </div>

          {!comment.isDeleted && (
            <CommentReactions
              reactions={comment.reactions}
              canReact={canComment}
              onAdd={handleAddReaction}
              onRemove={emoji => onRemoveReaction(comment.id, emoji)}
            />
          )}

          {!comment.isDeleted && (
            <div className="flex items-center gap-1">
              {canComment && (
                <EmojiPicker
                  onSelect={handleAddReaction}
                  trigger={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-caption text-muted-foreground"
                      aria-label={t('comments.reactions.add')}
                    >
                      <Smile className="size-3.5" aria-hidden="true" />
                    </Button>
                  }
                />
              )}
              {canComment && !isReply && onToggleReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-caption"
                  aria-expanded={isReplyOpen}
                  aria-controls={replyInputId}
                  onClick={onToggleReply}
                >
                  {t('comments.reply')}
                </Button>
              )}
              {comment.canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-caption"
                  onClick={() => onDelete(comment.id)}
                >
                  {t('comments.delete')}
                </Button>
              )}
              {/* On the LAST reply of a thread the same reply box is reachable
                  from the bottom of the group — so the user doesn't have to
                  scroll back up to the root comment's Reply button. Rendered
                  after Delete (Emoji · Delete · Reply in this thread). */}
              {canComment && isReply && onToggleReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-caption"
                  aria-expanded={isReplyOpen}
                  aria-controls={replyInputId}
                  onClick={onToggleReply}
                >
                  {t('comments.replyInThread')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
