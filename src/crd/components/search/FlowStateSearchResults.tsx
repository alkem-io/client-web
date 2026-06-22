import { AlertCircle, Loader2, SearchX } from 'lucide-react';
import type { Ref } from 'react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import { PostResultCard, type PostResultCardData } from './PostResultCard';

/**
 * The mutually-exclusive top-level state of a scoped flow-state search.
 * `loading` (skeleton, FR-023) and `empty` (FR-015) and `error` (FR-021) are
 * distinct; `appending` (footer spinner, FR-023) keeps prior results visible.
 */
export type FlowStateSearchStatus = 'loading' | 'results' | 'empty' | 'error';

export type FlowStateSearchLabels = {
  /** Empty-result message — distinct from the error message (FR-015). */
  emptyTitle: string;
  emptyDescription: string;
  /** Inline error message + retry affordance (FR-021), distinct from empty. */
  errorTitle: string;
  errorDescription: string;
  retry: string;
  /** Accessible label for the first-page skeleton (FR-023). */
  loadingLabel: string;
  /** Accessible label for the footer append spinner (FR-023). */
  appendingLabel: string;
  /** Accessible label for the results grid. */
  resultsLabel: string;
};

export type FlowStateSearchResultsProps = {
  status: FlowStateSearchStatus;
  /** Folded, callout-level results (FR-017), already mapped to card props. */
  results: PostResultCardData[];
  /** A page is being appended at the end while prior results stay visible (FR-023). */
  appending: boolean;
  /** Navigate to a result. The consumer decides where (CRD rule 3). */
  onResultClick: (href: string) => void;
  /** Re-issue the failed request (FR-021). */
  onRetry: () => void;
  /**
   * Intersection-observer sentinel ref. When it scrolls into view the consumer
   * loads the next page (FR-013). Rendered only while more pages may exist.
   */
  sentinelRef?: Ref<HTMLDivElement>;
  /** Whether the sentinel should be rendered (i.e. a cursor is still present). */
  hasMore: boolean;
  labels: FlowStateSearchLabels;
  className?: string;
};

const SKELETON_COUNT = 8;

function ResultsGrid({
  results,
  onResultClick,
  label,
}: {
  results: PostResultCardData[];
  onResultClick: (href: string) => void;
  label: string;
}) {
  return (
    <ul aria-label={label} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0 m-0">
      {results.map(result => (
        <li key={result.id}>
          <PostResultCard post={result} onClick={() => onResultClick(result.href)} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Presentational results surface for a per-flow-state scoped search. Pure CRD:
 * plain props, no GraphQL/routing/Apollo. Mirrors the global-search result
 * presentation (FR-016) and renders the four enumerated states plus the
 * incremental append spinner.
 */
export function FlowStateSearchResults({
  status,
  results,
  appending,
  onResultClick,
  onRetry,
  sentinelRef,
  hasMore,
  labels,
  className,
}: FlowStateSearchResultsProps) {
  if (status === 'loading') {
    return (
      <output aria-label={labels.loadingLabel} className={cn('block', className)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static placeholder list
            <Skeleton key={index} className="aspect-[3/4] w-full rounded-xl" />
          ))}
        </div>
      </output>
    );
  }

  if (status === 'error') {
    return (
      <div
        role="alert"
        className={cn(
          'flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center',
          className
        )}
      >
        <AlertCircle aria-hidden="true" className="size-8 text-destructive" />
        <div className="flex flex-col gap-1">
          <p className="text-subheader font-semibold text-foreground">{labels.errorTitle}</p>
          <p className="text-body text-muted-foreground">{labels.errorDescription}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {labels.retry}
        </Button>
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center',
          className
        )}
      >
        <SearchX aria-hidden="true" className="size-8 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <p className="text-subheader font-semibold text-foreground">{labels.emptyTitle}</p>
          <p className="text-body text-muted-foreground">{labels.emptyDescription}</p>
        </div>
      </div>
    );
  }

  // status === 'results'
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <ResultsGrid results={results} onResultClick={onResultClick} label={labels.resultsLabel} />

      {appending && (
        <output aria-label={labels.appendingLabel} className="flex justify-center py-4">
          <Loader2 aria-hidden="true" className="size-5 animate-spin text-muted-foreground" />
        </output>
      )}

      {/* Infinite-scroll sentinel — present only while a cursor remains (FR-013). */}
      {hasMore && !appending && <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />}
    </div>
  );
}
