import { useRef, useState } from 'react';
import { cn } from '@/crd/lib/utils';
import { Popover, PopoverAnchor, PopoverContent } from '@/crd/primitives/popover';
import type { CommentReaction } from './types';

// Touch-and-hold duration (ms) before the who-reacted popover opens on touch
// devices. Short taps below this threshold toggle the reaction as usual.
const LONG_PRESS_MS = 400;

type ReactionPillProps = {
  reaction: CommentReaction;
  /** When false the pill is non-interactive (no toggle), but hovering /
   *  long-pressing still reveals who reacted. */
  canReact: boolean;
  onToggle: () => void;
  /** Shown in the who-reacted popover when no senders are known (defensive —
   *  visible pills normally always carry their senders). */
  emptyLabel: string;
};

// A single reaction-count pill. Clicking (short tap) toggles the viewer's
// reaction for this emoji; hovering with a mouse or long-pressing on touch
// opens a popover listing the people who reacted — mirroring the +n overflow
// popover, but per individual reaction.
export function ReactionPill({ reaction, canReact, onToggle, emptyLabel }: ReactionPillProps) {
  const [open, setOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Set when a long-press opened the popover so the click that follows the
  // finger lift doesn't also toggle the reaction.
  const suppressClick = useRef(false);

  const clearLongPress = () => {
    if (longPressTimer.current !== undefined) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild={true}>
        <button
          type="button"
          aria-disabled={!canReact}
          aria-pressed={reaction.hasReacted}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-caption transition-colors',
            canReact ? 'cursor-pointer' : 'cursor-default',
            reaction.hasReacted
              ? 'border-primary/50 bg-primary/10 text-primary'
              : canReact
                ? 'border-border bg-background text-muted-foreground hover:bg-muted'
                : 'border-border bg-background text-muted-foreground'
          )}
          onClick={() => {
            if (suppressClick.current) {
              suppressClick.current = false;
              return;
            }
            if (!canReact) return;
            onToggle();
          }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onPointerDown={event => {
            if (event.pointerType !== 'touch') return;
            clearLongPress();
            longPressTimer.current = setTimeout(() => {
              suppressClick.current = true;
              setOpen(true);
            }, LONG_PRESS_MS);
          }}
          onPointerUp={event => {
            if (event.pointerType === 'touch') clearLongPress();
          }}
          onPointerLeave={clearLongPress}
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </button>
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-64 p-3"
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <div className="mb-1 font-medium text-body">
          {reaction.emoji} {reaction.count}
        </div>
        <div className="text-caption text-muted-foreground">
          {reaction.senders?.length ? reaction.senders.map(sender => sender.name).join(', ') : emptyLabel}
        </div>
      </PopoverContent>
    </Popover>
  );
}
