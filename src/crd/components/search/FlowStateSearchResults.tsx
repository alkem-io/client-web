import { AlertCircle, Loader2, SearchX } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { PostCardSkeleton } from '@/crd/components/space/PostCardSkeleton';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

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
};

export type FlowStateSearchResultsProps = {
  status: FlowStateSearchStatus;
  /**
   * The rendered results — supplied by the consumer so the scoped search reuses
   * the *default* callout feed presentation (FR-016) rather than a bespoke search
   * card. Rendered only in the `results` state.
   */
  children?: ReactNode;
  /** A page is being appended at the end while prior results stay visible (FR-023). */
  appending: boolean;
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

const SKELETON_COUNT = 3;

/**
 * State surface for a per-flow-state scoped search. Pure CRD: plain props, no
 * GraphQL/routing/Apollo. Owns the four enumerated states (loading skeleton,
 * empty, retryable error, results) plus the incremental append spinner and the
 * infinite-scroll sentinel. The `results` state renders the consumer-supplied
 * `children` — the default callout feed — so scoped search looks identical to
 * browsing the tab (FR-016), just filtered to the matches.
 */
export function FlowStateSearchResults({
  status,
  children,
  appending,
  onRetry,
  sentinelRef,
  hasMore,
  labels,
  className,
}: FlowStateSearchResultsProps) {
  if (status === 'loading') {
    return (
      <output aria-label={labels.loadingLabel} className={cn('block space-y-6', className)}>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static placeholder list
          <PostCardSkeleton key={index} />
        ))}
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
    <div className={cn('space-y-6', className)}>
      {children}

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
