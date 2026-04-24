import { Smile } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { CommentEmojiPicker } from './CommentEmojiPicker';
import { CommentInput } from './CommentInput';
import { CommentReactions } from './CommentReactions';
import type { CommentAuthor, CommentData, CrdMentionSearch } from './types';

type CommentItemProps = {
  comment: CommentData;
  onReply: (parentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
  currentUser?: CommentAuthor;
  mentionSearch?: CrdMentionSearch;
  isReply?: boolean;
};

export function CommentItem({
  comment,
  onReply,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  currentUser,
  mentionSearch,
  isReply,
}: CommentItemProps) {
  const { t } = useTranslation('crd-space');
  const [isReplying, setIsReplying] = useState(false);
  const replyInputId = `comment-reply-input-${comment.id}`;

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
        <Avatar className="h-8 w-8 shrink-0">
          {comment.author.avatarUrl && <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />}
          <AvatarFallback className="text-caption">{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className={cn('relative', isLongComment ? 'w-full' : 'w-fit max-w-[min(460px,100%)]')}>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <div className="flex items-center gap-2 pr-8">
                <span className="text-body-emphasis text-foreground">{comment.author.name}</span>
                <span className="text-caption text-muted-foreground">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
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

            {!comment.isDeleted && (
              <div className="absolute -top-3 right-2 flex items-center rounded-md border border-border bg-background opacity-100 shadow-sm transition-opacity focus-within:opacity-100 md:opacity-0 md:group-hover/comment:opacity-100">
                <CommentEmojiPicker
                  onSelect={handleAddReaction}
                  trigger={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      aria-label={t('comments.reactions.add')}
                    >
                      <Smile className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  }
                />
              </div>
            )}
          </div>

          <CommentReactions
            reactions={comment.reactions}
            onAdd={handleAddReaction}
            onRemove={emoji => onRemoveReaction(comment.id, emoji)}
          />

          {!comment.isDeleted && (
            <div className="flex items-center gap-1">
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-caption"
                  aria-expanded={isReplying}
                  aria-controls={replyInputId}
                  onClick={() => setIsReplying(current => !current)}
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
            </div>
          )}
        </div>
      </div>

      {isReplying && !comment.isDeleted && (
        <div id={replyInputId} className="ml-6 md:ml-10">
          <CommentInput
            currentUser={currentUser}
            mentionSearch={mentionSearch}
            onSubmit={content => {
              onReply(comment.id, content);
              setIsReplying(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
