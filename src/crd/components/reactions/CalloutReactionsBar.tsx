import { useState } from 'react';
import { ReactionEmojiPicker } from './ReactionEmojiPicker';
import { ReactionTotalPill } from './ReactionTotalPill';
import type { WhoReactedRow } from './WhoReactedPopover';
import { WhoReactedPopover } from './WhoReactedPopover';

export type CalloutReactionsSummary = {
  /** Total distinct people who reacted */
  total: number;
  /** Distinct emoji slugs currently in use */
  emojis: string[];
  /** The viewer's current reaction emoji slug, or null if they haven't reacted */
  myReactionEmoji?: string | null;
  /** Server-provided list of allowed emoji slugs — picker renders exactly these */
  allowedEmojis: string[];
};

export type CalloutReactionsBarProps = {
  summary: CalloutReactionsSummary;
  /** Whether the current viewer may add or change their reaction. When false
   *  the picker trigger is hidden; the total pill and who-reacted remain visible. */
  canReact: boolean;
  /** Called with the slug when the viewer picks a new emoji */
  onAdd: (slug: string) => void;
  /** Called when the viewer removes their current reaction (clicks their own emoji) */
  onRemove: () => void;
  /** Called when who-reacted rows are needed (lazy — only on first open). The
   *  connector fires the tier-2 query and calls back with the rows. */
  onLoadWhoReacted?: () => void;
  /** Who-reacted rows provided by the connector after the lazy load completes */
  whoReactedRows?: WhoReactedRow[];
};

/**
 * Composition root for callout reactions. Props-only — zero Apollo imports.
 * Shared between the callout card inline on the space page and the callout
 * detail dialog. Renders:
 *  - The add-reaction trigger (picker) when canReact is true
 *  - The total pill (distinct emoji chips + combined total)
 *  - The who-reacted popover (opens from the total on click)
 */
export function CalloutReactionsBar({
  summary,
  canReact,
  onAdd,
  onRemove,
  onLoadWhoReacted,
  whoReactedRows = [],
}: CalloutReactionsBarProps) {
  const [whoReactedOpen, setWhoReactedOpen] = useState(false);

  const handleOpenWhoReacted = () => {
    if (!whoReactedOpen) {
      onLoadWhoReacted?.();
    }
    setWhoReactedOpen(true);
  };

  const handlePickerSelect = (slug: string) => {
    if (summary.myReactionEmoji === slug) {
      // Clicking the own emoji again — treat as remove
      onRemove();
    } else {
      onAdd(slug);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Add-reaction trigger — hidden when viewer cannot react */}
      {canReact && (
        <ReactionEmojiPicker
          allowedEmojis={summary.allowedEmojis}
          currentEmoji={summary.myReactionEmoji}
          onSelect={handlePickerSelect}
        />
      )}

      {/* Total pill with who-reacted popover on click */}
      {summary.total > 0 && (
        <WhoReactedPopover
          rows={whoReactedRows}
          open={whoReactedOpen}
          onOpenChange={setWhoReactedOpen}
          trigger={
            <ReactionTotalPill
              emojis={summary.emojis}
              total={summary.total}
              myReactionEmoji={summary.myReactionEmoji}
              onOpenWhoReacted={handleOpenWhoReacted}
            />
          }
        />
      )}
    </div>
  );
}
