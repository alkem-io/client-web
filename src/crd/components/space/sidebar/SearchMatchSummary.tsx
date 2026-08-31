import { X } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

export type SearchMatchSummaryProps = {
  /** Rendered result-card count — an exact number or an "N+" placeholder while more pages remain. */
  matchCount: string;
  /** The applied (searched) text, empty when no text filter is active. */
  text: string;
  /** Selected tags, in the order they were toggled on. */
  tags: string[];
  onClear: () => void;
  className?: string;
};

/**
 * Gray summary strip under the sidebar search field's tag chips — states how
 * many result cards match the active text and/or tag filters, and offers a
 * single control to clear both at once. Purely presentational: the count and
 * terms are supplied by the page that owns the search state; the three
 * sentences are resolved through translation-layer component interpolation
 * so a tag or search term can never be interpreted as markup.
 */
export function SearchMatchSummary({ matchCount, text, tags, onClear, className }: SearchMatchSummaryProps) {
  const { t } = useTranslation(['crd-space', 'crd-common']);

  const hasTags = tags.length > 0;
  const hasText = text.length > 0;
  const i18nKey = hasTags && hasText ? 'matchBoth' : hasTags ? 'matchTags' : 'matchText';
  const quotedTags = tags.map(tag => `"${tag}"`).join(' + ');
  const quotedText = `"${text}"`;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-caption text-muted-foreground',
        className
      )}
    >
      <span>
        <Trans
          i18nKey={`knowledge.search.${i18nKey}`}
          ns="crd-space"
          values={{ matches: matchCount, tags: quotedTags, text: quotedText }}
          components={{ b: <strong className="font-semibold text-foreground" /> }}
        />
      </span>
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
