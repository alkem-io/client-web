import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { SpaceCollection } from '@/crd/components/callout/SpaceCollection/SpaceCollection';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { useCrdSpaceSubspaces } from '@/main/crdPages/space/hooks/useCrdSpaceSubspaces';

/**
 * Integration layer for a Spaces-collection callout (feature 013). Fetches the
 * host space's subspaces via `useCrdSpaceSubspaces(calloutId)` and wires them to
 * the presentational `SpaceCollection` (a thin wrapper over `SpaceSubspacesList`),
 * plus subspace-card navigation. The CRD renderer stays purely presentational.
 */

type SpaceCollectionConnectorProps = {
  calloutId: string;
  /**
   * Card variant (feature 076) — required on purpose: TypeScript fails if a mount site
   * forgets to pass it (FR-030, this callout renders in two places — the feed and the
   * post detail dialog — and both must agree).
   */
  cardVariant: 'compact' | 'expanded';
  className?: string;
};

export function SpaceCollectionConnector({ calloutId, cardVariant, className }: SpaceCollectionConnectorProps) {
  const navigate = useNavigate();
  // The subspace cards need the lazily-loaded `crd-exploreSpaces` namespace, but they only
  // mount once the query resolves — suspending then would swap the already-rendered card
  // for its skeleton. Pull the namespace in here, while the card's boundary is still
  // showing the skeleton anyway (issue #10043).
  useTranslation('crd-exploreSpaces');
  const { subspaces, loading } = useCrdSpaceSubspaces(calloutId, cardVariant === 'expanded');

  const handleSubspaceClick = (space: SpaceCardData) => navigate(space.href);

  return (
    <SpaceCollection
      className={className}
      subspaces={subspaces}
      loading={loading}
      variant={cardVariant}
      onSubspaceClick={handleSubspaceClick}
    />
  );
}
