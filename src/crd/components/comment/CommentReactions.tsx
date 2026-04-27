import { Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';
import { CommentEmojiPicker } from './CommentEmojiPicker';
import type { CommentReaction } from './types';

type CommentReactionsProps = {
  reactions: CommentReaction[];
  onAdd: (emoji: string) => void;
  onRemove: (emoji: string) => void;
};

const MAX_VISIBLE_REACTIONS = 5;

export function CommentReactions({ reactions, onAdd, onRemove }: CommentReactionsProps) {
  const { t } = useTranslation('crd-space');

  if (reactions.length === 0) return null;

  const visibleReactions = reactions.slice(0, MAX_VISIBLE_REACTIONS);
  const hiddenReactions = reactions.slice(MAX_VISIBLE_REACTIONS);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleReactions.map(reaction => (
        <button
          key={reaction.emoji}
          type="button"
          className={[
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-caption transition-colors',
            reaction.hasReacted
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-border bg-background text-muted-foreground hover:bg-muted',
          ].join(' ')}
          aria-pressed={reaction.hasReacted}
          onClick={() => (reaction.hasReacted ? onRemove(reaction.emoji) : onAdd(reaction.emoji))}
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </button>
      ))}

      {hiddenReactions.length > 0 && (
        <Popover>
          <PopoverTrigger asChild={true}>
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-caption text-muted-foreground hover:bg-muted"
              aria-label={t('comments.reactions.overflow', { count: hiddenReactions.length })}
            >
              {t('comments.reactions.overflow', { count: hiddenReactions.length })}
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-64 p-3">
            <div className="space-y-2">
              {hiddenReactions.map(reaction => (
                <div key={reaction.emoji} className="rounded-md border border-border p-2 text-body">
                  <div className="mb-1 font-medium">
                    {reaction.emoji} {reaction.count}
                  </div>
                  <div className="text-caption text-muted-foreground">
                    {reaction.senders?.length
                      ? reaction.senders.map(sender => sender.name).join(', ')
                      : t('comments.reactions.add')}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      <CommentEmojiPicker
        onSelect={onAdd}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t('comments.reactions.add')}
          >
            <Smile className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        }
      />
    </div>
  );
}
