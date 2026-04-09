import { Send } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { CalloutCommentItem } from './CalloutCommentItem';

type CommentData = {
  id: string;
  author: { name: string; avatarUrl?: string };
  content: string;
  timestamp: string;
  parentId?: string;
};

type CalloutCommentsProps = {
  comments: CommentData[];
  canComment: boolean;
  onAddComment: (content: string) => void;
  onReply?: (parentId: string, content: string) => void;
  className?: string;
};

export function CalloutComments({ comments, canComment, onAddComment, className }: CalloutCommentsProps) {
  const { t } = useTranslation('crd-space');
  const [newComment, setNewComment] = useState('');

  const topLevelComments = comments.filter(c => !c.parentId);
  const repliesMap = new Map<string, CommentData[]>();
  comments
    .filter(c => c.parentId)
    .forEach(c => {
      // biome-ignore lint/style/noNonNullAssertion: filtered
      const existing = repliesMap.get(c.parentId!) ?? [];
      // biome-ignore lint/style/noNonNullAssertion: filtered
      repliesMap.set(c.parentId!, [...existing, c]);
    });

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Comment list */}
      {topLevelComments.map(comment => (
        <div key={comment.id} className="space-y-3">
          <CalloutCommentItem author={comment.author} content={comment.content} timestamp={comment.timestamp} />
          {/* Replies */}
          {repliesMap.get(comment.id)?.map(reply => (
            <CalloutCommentItem
              key={reply.id}
              author={reply.author}
              content={reply.content}
              timestamp={reply.timestamp}
              isReply={true}
            />
          ))}
        </div>
      ))}

      {/* Add comment form */}
      {canComment && (
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={t('forms.descriptionPlaceholder')}
            className="flex-1 h-9 px-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            aria-label={t('forms.descriptionPlaceholder')}
          />
          <Button
            size="icon"
            className="h-9 w-9"
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            aria-label={t('callout.sendComment')}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
