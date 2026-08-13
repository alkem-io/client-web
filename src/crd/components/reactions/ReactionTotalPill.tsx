import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { glyphForSlug } from './reactionEmoji';

export type ReactionTotalPillProps = {
  /** Distinct emoji slugs currently in use on this callout. Unknown slugs are
   *  silently skipped — never rendered as raw text. */
  emojis: string[];
  /** Total count of distinct people who reacted. */
  total: number;
  /** The slug of the viewer's current reaction, if they have one. Controls the
   *  primary-tint styling on the pill. */
  myReactionEmoji?: string | null;
  /** Called when the viewer clicks the total pill to open the who-reacted list. */
  onOpenWhoReacted?: () => void;
};

/**
 * Displays the distinct emoji glyphs currently in use and ONE combined total.
 * Never renders a per-emoji count — the anti-gamification guarantee.
 *
 * Hidden when total is 0 (no reactions yet — the add button is the only affordance).
 */
export function ReactionTotalPill({ emojis, total, myReactionEmoji, onOpenWhoReacted }: ReactionTotalPillProps) {
  const { t } = useTranslation('crd-reactions');

  if (total === 0) return null;

  const knownEmojis = emojis.map(slug => ({ slug, glyph: glyphForSlug(slug) })).filter(e => e.glyph !== undefined);

  const hasOwnReaction = myReactionEmoji != null;
  const ownGlyph = myReactionEmoji ? glyphForSlug(myReactionEmoji) : undefined;

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-caption transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        hasOwnReaction
          ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15'
          : 'border-border bg-background text-muted-foreground hover:bg-muted',
        onOpenWhoReacted ? 'cursor-pointer' : 'cursor-default'
      )}
      aria-pressed={hasOwnReaction}
      aria-label={t('totalAriaLabel', { count: total })}
      onClick={onOpenWhoReacted}
    >
      {/* Distinct emoji chips — known glyphs only; unknown slugs silently skipped */}
      {knownEmojis.length > 0 && (
        <span className="flex items-center gap-0.5" aria-hidden="true">
          {knownEmojis.map(({ slug, glyph }) => (
            <span key={slug}>{glyph}</span>
          ))}
        </span>
      )}
      {/* Own-reaction glyph is already included in the emojis list so no
          separate glyph chip is needed here — the tint communicates ownership */}
      {ownGlyph && knownEmojis.length === 0 && <span aria-hidden="true">{ownGlyph}</span>}
      {/* ONE total count — never a per-emoji number */}
      <span>{total}</span>
    </button>
  );
}
