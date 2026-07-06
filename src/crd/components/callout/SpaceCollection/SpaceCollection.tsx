import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { SpaceSubspacesList } from '@/crd/components/space/SpaceSubspacesList';

export type SpaceCollectionProps = {
  /**
   * The host space's subspaces for a SPACES callout, already mapped to card props
   * and in server order (pinned-first). Passed straight to the reused
   * `SpaceSubspacesList`.
   */
  subspaces: SpaceCardData[];
  /** Navigate to a subspace when its card is clicked. */
  onSubspaceClick?: (space: SpaceCardData) => void;
  className?: string;
};

/**
 * Spaces-collection callout renderer (feature 013).
 *
 * A THIN WRAPPER around the existing `SpaceSubspacesList` — which already renders
 * the `SpaceCard` (unchanged, FR-003) and owns the name search + tag/status
 * filters + "show more" pagination + empty state. Reusing it verbatim keeps the
 * exact search/filter behaviour of the hard-coded subspaces block this callout
 * replaces (parity — research R6). Cards only: no map, no counts, no segmented
 * switch (FR-008/FR-009).
 *
 * Purely presentational (CRD): all data + navigation flow in via props; the
 * connector in `src/main/crdPages/space/callout/` fetches and wires them.
 */
export function SpaceCollection({ subspaces, onSubspaceClick, className }: SpaceCollectionProps) {
  return <SpaceSubspacesList subspaces={subspaces} onSubspaceClick={onSubspaceClick} className={className} />;
}
