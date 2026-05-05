import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CommentItem } from './CommentItem';
import type { CommentData, CommentsContainerData, CrdMentionSearch } from './types';

type CommentThreadProps = CommentsContainerData & {
  mentionSearch?: CrdMentionSearch;
};

/**
 * Thread list component: comment count header + comment items + reply indentation.
 * Top-level comments render newest-first; replies render oldest-first within
 * their parent thread. Does NOT include a comment input — that is rendered by
 * the parent composite (EventDetailView, CalloutDetailDialog) above the thread.
 */
export function CommentThread({
  comments,
  currentUser,
  loading,
  onReply,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  mentionSearch,
}: CommentThreadProps) {
  const { t } = useTranslation('crd-space');

  const topLevel = comments.filter(comment => !comment.parentId);
  const repliesByParent = new Map<string, CommentData[]>();

  for (const comment of comments) {
    if (!comment.parentId) continue;

    const existing = repliesByParent.get(comment.parentId) ?? [];
    repliesByParent.set(comment.parentId, [...existing, comment]);
  }

  const sortedTopLevel = [...topLevel].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

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
      {/* Comment count header */}
      <p className="text-body text-muted-foreground">{t('comments.count', { count: comments.length })}</p>

      {/* Comment list */}
      {loading ? (
        <output
          className="flex items-center gap-2 text-body text-muted-foreground py-4"
          aria-label={t('comments.loading')}
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{t('comments.loading')}</span>
        </output>
      ) : comments.length === 0 ? (
        <p className="text-body text-muted-foreground py-4">{t('comments.empty')}</p>
      ) : (
        <div className="space-y-4">
          {threaded.topLevel.map(comment => (
            <div key={comment.id} className="space-y-3">
              <CommentItem
                comment={comment}
                currentUser={currentUser}
                mentionSearch={mentionSearch}
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
                  mentionSearch={mentionSearch}
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
