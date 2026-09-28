import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { SpaceSubspacesList } from '@/crd/components/space/SpaceSubspacesList';
import { cn } from '@/crd/lib/utils';

export type SpaceCollectionProps = {
  /**
   * The host space's subspaces for a SPACES callout, already mapped to card props
   * and in server order (pinned-first). Passed straight to the reused
   * `SpaceSubspacesList`.
   */
  subspaces: SpaceCardData[];
  /** Whether the subspace set is still loading (renders a spinner, not the empty state). */
  loading?: boolean;
  /**
   * Card variant. `'compact'` (default) is today's 3-up grid;
   * `'expanded'` renders one rich card per row with What/Why/Who excerpts.
   */
  variant?: 'compact' | 'expanded';
  /** Navigate to a subspace when its card is clicked. */
  onSubspaceClick?: (space: SpaceCardData) => void;
  className?: string;
};

/**
 * Spaces-collection callout renderer.
 *
 * A THIN WRAPPER around the existing `SpaceSubspacesList` — which already renders
 * the `SpaceCard` (unchanged) and owns the name search + tag/status
 * filters + "show more" pagination + empty state. Reusing it verbatim keeps the
 * exact search/filter behaviour of the hard-coded subspaces block this callout
 * replaces (parity with prior behaviour). Cards only: no map, no counts, no segmented
 * switch.
 *
 * Purely presentational (CRD): all data + navigation flow in via props; the
 * connector in `src/main/crdPages/space/callout/` fetches and wires them.
 */
export function SpaceCollection({
  subspaces,
  loading = false,
  variant = 'compact',
  onSubspaceClick,
  className,
}: SpaceCollectionProps) {
  const { t } = useTranslation('crd-space');

  // While the first fetch is in flight, show a spinner rather than briefly
  // flashing SpaceSubspacesList's empty state.
  if (loading && subspaces.length === 0) {
    return (
      <output className={cn('flex items-center justify-center py-12', className)} aria-label={t('callout.subspaces')}>
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </output>
    );
  }

  return (
    <SpaceSubspacesList
      subspaces={subspaces}
      variant={variant}
      onSubspaceClick={onSubspaceClick}
      className={className}
    />
  );
}
