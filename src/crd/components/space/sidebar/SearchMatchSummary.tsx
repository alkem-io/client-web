import { X } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

export type SearchMatchSummaryProps = {
  /** Number of result cards rendered so far. */
  count: number;
  /** True while more pages remain — the count is then read as "N+". */
  hasMore: boolean;
  /** The applied (searched) text, empty when no text filter is active. */
  text: string;
  /** Selected tags, in the order they were toggled on. */
  tags: string[];
  onClear: () => void;
  className?: string;
};

/**
 * Gray summary strip under the sidebar search field's tag chips — states how
 * many result cards relate to the active text and/or tags, and offers a
 * single control to clear both at once. Purely presentational: the count and
 * terms are supplied by the page that owns the search state.
 *
 * The user-typed text and the tag names are rendered by the `<text>` /
 * `<tags>` translation components as their own prop — never as interpolation
 * values. `<Trans>` interpolates its text nodes a second time after `t()` has
 * run, so a value such as `{{count}}` typed into the field would be
 * substituted instead of shown literally; a prop rendered by a component is
 * inert text.
 */
/** A user-provided term, rendered verbatim by React (see above). */
const Term = ({ value }: { value: string }) => <strong className="font-semibold text-foreground">{value}</strong>;

export function SearchMatchSummary({ count, hasMore, text, tags, onClear, className }: SearchMatchSummaryProps) {
  const { t } = useTranslation(['crd-space', 'crd-common']);

  const hasTags = tags.length > 0;
  const hasText = text.length > 0;
  const sentence = hasTags && hasText ? 'matchBoth' : hasTags ? 'matchTags' : 'matchText';
  // "N+ items" is always plural; the exact count picks its own plural form.
  const i18nKey = hasMore ? (`knowledge.search.${sentence}More` as const) : (`knowledge.search.${sentence}` as const);
  const quotedTags = tags.map(tag => `"${tag}"`).join(' + ');
  const quotedText = `"${text}"`;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-caption text-muted-foreground',
        className
      )}
    >
      <output aria-live="polite" aria-atomic="true">
        <Trans
          i18nKey={i18nKey}
          ns="crd-space"
          count={count}
          values={{ tagLabel: t('crd-space:knowledge.search.tagLabel', { count: tags.length }) }}
          components={{
            b: <strong className="font-semibold text-foreground" />,
            text: <Term value={quotedText} />,
            tags: <Term value={quotedTags} />,
          }}
        />
      </output>
      <button
        type="button"
        aria-label={t('crd-common:filters.clear')}
        onClick={onClear}
        className="shrink-0 rounded p-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
