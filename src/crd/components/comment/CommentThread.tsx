import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { CommentItem } from './CommentItem';
import type { CommentData, CommentsContainerData } from './types';

type SortOrder = 'newest' | 'oldest';

/**
 * Thread list component: sort toggle + comment items + reply indentation.
 * Does NOT include a sticky comment input — that is rendered by the parent
 * (CalloutDetailDialog) as a sticky footer, keeping layout concerns separated.
 */
export function CommentThread({
  comments,
  currentUser,
  loading,
  onReply,
  onDelete,
  onAddReaction,
  onRemoveReaction,
}: CommentsContainerData) {
  const { t } = useTranslation('crd-space');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const topLevel = comments.filter(comment => !comment.parentId);
  const repliesByParent = new Map<string, CommentData[]>();

  for (const comment of comments) {
    if (!comment.parentId) continue;

    const existing = repliesByParent.get(comment.parentId) ?? [];
    repliesByParent.set(comment.parentId, [...existing, comment]);
  }

  const sortedTopLevel = [...topLevel].sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
  });

  for (const [parentId, replies] of repliesByParent.entries()) {
    repliesByParent.set(
      parentId,
      [...replies].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    );
  }

  const threaded = {
    topLevel: sortedTopLevel,
    repliesByParent,
  };

  return (
    <div className="space-y-4">
      {/* Sort toggle header */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{t('comments.count', { count: comments.length })}</p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setSortOrder(current => (current === 'newest' ? 'oldest' : 'newest'))}
        >
          {sortOrder === 'newest' ? t('comments.sortNewest') : t('comments.sortOldest')}
        </Button>
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t('comments.loading')}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">{t('comments.empty')}</p>
      ) : (
        <div className="space-y-4">
          {threaded.topLevel.map(comment => (
            <div key={comment.id} className="space-y-3">
              <CommentItem
                comment={comment}
                currentUser={currentUser}
                onReply={onReply}
                onDelete={onDelete}
                onAddReaction={onAddReaction}
                onRemoveReaction={onRemoveReaction}
              />

              {(threaded.repliesByParent.get(comment.id) ?? []).map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  isReply={true}
                  onReply={onReply}
                  onDelete={onDelete}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
