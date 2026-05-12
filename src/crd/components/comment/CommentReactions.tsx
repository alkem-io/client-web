import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/crd/primitives/popover';
import type { CommentReaction } from './types';

// The add-NEW-reaction picker (smiley used to pick an emoji that isn't yet
// on this comment) now lives in CommentItem's action row next to Reply /
// Delete, so it is always reachable — including for comments with zero
// existing reactions. This component renders only:
//   - the reaction-count pills (clicking a pill toggles the viewer's
//     reaction for that emoji on or off),
//   - and the overflow popover for the 6th+ reaction kinds.
// When there are no reactions the row hides itself entirely (no empty row).
type CommentReactionsProps = {
  reactions: CommentReaction[];
  /** When false, pills are rendered as non-interactive labels — viewers
   *  who aren't allowed to react can still see who reacted, but can't
   *  toggle anything. Defaults to true. */
  canReact?: boolean;
  onAdd: (emoji: string) => void;
  onRemove: (emoji: string) => void;
};

const MAX_VISIBLE_REACTIONS = 5;

export function CommentReactions({ reactions, canReact = true, onAdd, onRemove }: CommentReactionsProps) {
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
          disabled={!canReact}
          className={[
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-caption transition-colors',
            canReact ? 'cursor-pointer' : 'cursor-default',
            reaction.hasReacted
              ? 'border-primary/50 bg-primary/10 text-primary'
              : canReact
                ? 'border-border bg-background text-muted-foreground hover:bg-muted'
                : 'border-border bg-background text-muted-foreground',
          ].join(' ')}
          aria-pressed={reaction.hasReacted}
          onClick={() => {
            if (!canReact) return;
            return reaction.hasReacted ? onRemove(reaction.emoji) : onAdd(reaction.emoji);
          }}
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
              className="inline-flex cursor-pointer items-center rounded-full border border-border px-2 py-0.5 text-caption text-muted-foreground hover:bg-muted"
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
    </div>
  );
}
