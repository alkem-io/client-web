import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';
import type { CommentData, CommentsContainerData, CrdMentionSearch } from './types';

type CommentThreadProps = CommentsContainerData & {
  mentionSearch?: CrdMentionSearch;
};

/**
 * Thread list component: comment count header + comment items + reply indentation.
 * Top-level comments render newest-first; replies render oldest-first within
 * their parent thread. Does NOT include a top-level comment input — that is
 * rendered by the parent composite above the thread.
 *
 * The per-comment reply input is positioned at the END of the parent's reply
 * group (after any existing replies) so it visually lands in the same spot
 * where the new reply will appear once posted.
 */
export function CommentThread({
  comments,
  currentUser,
  loading,
  canComment = true,
  onReply,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  mentionSearch,
}: CommentThreadProps) {
  const { t } = useTranslation('crd-space');

  // Which top-level comment's Reply button is open. Lifted here (vs. inside
  // each CommentItem) so the reply input renders at the bottom of the parent's
  // reply group — matching where the new reply lands after posting.
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | undefined>(undefined);

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
        <ul className="space-y-4">
          {sortedTopLevel.map(comment => {
            const replies = repliesByParent.get(comment.id) ?? [];
            const isReplyOpen = replyingToCommentId === comment.id;
            const replyInputId = `comment-reply-input-${comment.id}`;

            return (
              <li key={comment.id} className="space-y-3">
                <CommentItem
                  comment={comment}
                  canComment={canComment}
                  isReplyOpen={isReplyOpen}
                  replyInputId={replyInputId}
                  onToggleReply={
                    canComment
                      ? () => setReplyingToCommentId(current => (current === comment.id ? undefined : comment.id))
                      : undefined
                  }
                  onDelete={onDelete}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                />

                {replies.length > 0 && (
                  <ul className="space-y-3">
                    {replies.map(reply => (
                      <li key={reply.id}>
                        <CommentItem
                          comment={reply}
                          canComment={canComment}
                          isReply={true}
                          onDelete={onDelete}
                          onAddReaction={onAddReaction}
                          onRemoveReaction={onRemoveReaction}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {isReplyOpen && !comment.isDeleted && (
                  <div id={replyInputId} className="ml-6 md:ml-10">
                    <CommentInput
                      currentUser={currentUser}
                      mentionSearch={mentionSearch}
                      onSubmit={content => {
                        onReply(comment.id, content);
                        setReplyingToCommentId(undefined);
                      }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
