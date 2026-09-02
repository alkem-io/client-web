import { useTranslation } from 'react-i18next';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { SearchMatchSummary } from '@/crd/components/space/sidebar/SearchMatchSummary';
import { SearchField } from '@/crd/forms/SearchField';
import { cn } from '@/crd/lib/utils';

export type SearchSectionProps = {
  /** The raw, controlled input value (not yet applied — the page debounces it). */
  text: string;
  onTextChange: (value: string) => void;
  /** The applied (searched) text — what the summary label quotes. */
  appliedText: string;
  /** The tags of the callouts visible in this tab's flow state, most frequent first. */
  allTags: string[];
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
      {allTags.length > 0 && (
        <CollapsibleTagList tags={allTags} selectedTags={selectedTags} onTagClick={onToggleTag} maxRows={2} />
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
