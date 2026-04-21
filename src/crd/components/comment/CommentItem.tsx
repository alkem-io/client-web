import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { CommentInput } from './CommentInput';
import { CommentReactions } from './CommentReactions';
import type { CommentAuthor, CommentData } from './types';

type CommentItemProps = {
  comment: CommentData;
  onReply: (parentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
  currentUser?: CommentAuthor;
  isReply?: boolean;
};

export function CommentItem({
  comment,
  onReply,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  currentUser,
  isReply,
}: CommentItemProps) {
  const { t } = useTranslation('crd-space');
  const [isReplying, setIsReplying] = useState(false);

  return (
    <div className={cn('space-y-2', isReply && 'ml-10')}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          {comment.author.avatarUrl && <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />}
          <AvatarFallback className="text-caption">{comment.author.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-body-emphasis text-foreground">{comment.author.name}</span>
            <span className="text-caption text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</span>
          </div>

          {comment.isDeleted ? (
            <p className="text-body italic text-muted-foreground">{t('comments.deleted')}</p>
          ) : (
            <p className="whitespace-pre-wrap text-body text-foreground">{comment.content}</p>
          )}

          <div className="flex items-center gap-2">
            {!comment.isDeleted && !isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-caption"
                onClick={() => setIsReplying(current => !current)}
              >
                {t('comments.reply')}
              </Button>
            )}
            {comment.canDelete && !comment.isDeleted && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-caption" onClick={() => onDelete(comment.id)}>
                {t('comments.delete')}
              </Button>
            )}
          </div>

          <CommentReactions
            reactions={comment.reactions}
            onAdd={emoji => onAddReaction(comment.id, emoji)}
            onRemove={emoji => onRemoveReaction(comment.id, emoji)}
          />
        </div>
      </div>

      {isReplying && !comment.isDeleted && (
        <div className="ml-10">
          <CommentInput
            currentUser={currentUser}
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
