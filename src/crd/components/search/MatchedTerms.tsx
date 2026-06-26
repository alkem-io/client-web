import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { cn } from '@/crd/lib/utils';

export type MatchedTermsProps = {
  /**
   * The query-ordered, de-duplicated terms that caused this result to match
   * (server `ISearchResult.terms`). Passed WHOLE — never pre-sliced — so the
   * one-row fold inside `CollapsibleTagList` derives an exact `+N` overflow.
   */
  terms?: string[];
  className?: string;
};

/**
 * Renders the matched query terms for a search result as chips. Capped at a
 * single row by `CollapsibleTagList` (`maxRows={1}`), with the remainder folded
 * into an exact `+N` chip. Empty/undefined terms render nothing — no label, no
 * empty chip box (FR-004, FR-005, FR-010).
 */
export function MatchedTerms({ terms, className }: MatchedTermsProps) {
  if (!terms || terms.length === 0) return null;

  return (
    <div data-testid="matched-terms" className={cn('min-w-0', className)}>
      <CollapsibleTagList tags={terms} maxRows={1} />
    </div>
  );
}
