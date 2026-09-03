import { useTranslation } from 'react-i18next';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { SearchMatchSummary } from '@/crd/components/space/sidebar/SearchMatchSummary';
import { SearchField } from '@/crd/forms/SearchField';
import { cn } from '@/crd/lib/utils';
import { Skeleton } from '@/crd/primitives/skeleton';

/** Chip widths for the loading placeholder — two rows, like the capped tag list. */
const PLACEHOLDER_CHIPS = [
  { key: 'chip-1', width: 'w-16' },
  { key: 'chip-2', width: 'w-12' },
  { key: 'chip-3', width: 'w-20' },
  { key: 'chip-4', width: 'w-14' },
  { key: 'chip-5', width: 'w-24' },
  { key: 'chip-6', width: 'w-12' },
];

export type SearchSectionProps = {
  /** The raw, controlled input value (not yet applied — the page debounces it). */
  text: string;
  onTextChange: (value: string) => void;
  /** The applied (searched) text — what the summary label quotes. */
  appliedText: string;
  /** The tags of the callouts visible in this tab's flow state, most frequent first. */
  allTags: string[];
  /**
   * True while `allTags` is still being fetched. Holds the two chip rows' footprint so
   * the widgets below don't get pushed down when the tags land.
   */
  tagsLoading?: boolean;
  /** Currently-toggled tags, in the order they were selected. */
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  /** Number of result cards rendered so far. `undefined` while unknown (loading/error/no filter). */
  matchCount?: number;
  /** True while more result pages remain — the summary then reads the count as "N+". */
  hasMore?: boolean;
  /** Clears both the text and every selected tag in one call. */
  onClear: () => void;
  className?: string;
};

/**
 * Sidebar search widget: a live text field, the tab's tag chips in toggle
 * mode, and — once a filter is active and answered — the gray match summary
 * with its clear control. Pure and props-only: all state and data fetching
 * are owned by the page that renders this into both the desktop sidebar
 * column and the mobile drawer.
 */
export function SearchSection({
  text,
  onTextChange,
  appliedText,
  allTags,
  tagsLoading = false,
  selectedTags,
  onToggleTag,
  matchCount,
  hasMore = false,
  onClear,
  className,
}: SearchSectionProps) {
  const { t } = useTranslation('crd-space');

  const hasActiveFilter = appliedText.length > 0 || selectedTags.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      <SearchField
        value={text}
        onValueChange={onTextChange}
        placeholder={t('knowledge.searchPlaceholder')}
        ariaLabel={t('knowledge.searchLabel')}
      />
      {allTags.length > 0 ? (
        <CollapsibleTagList tags={allTags} selectedTags={selectedTags} onTagClick={onToggleTag} maxRows={2} />
      ) : (
        tagsLoading && (
          <div className="flex flex-wrap gap-1.5" aria-hidden="true">
            {PLACEHOLDER_CHIPS.map(chip => (
              <Skeleton key={chip.key} className={cn('h-7 rounded-full', chip.width)} />
            ))}
          </div>
        )
      )}
      {matchCount !== undefined && hasActiveFilter && (
        <SearchMatchSummary
          count={matchCount}
          hasMore={hasMore}
          text={appliedText}
          tags={selectedTags}
          onClear={onClear}
        />
      )}
    </div>
  );
}
