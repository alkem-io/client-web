import { useTranslation } from 'react-i18next';
import type { CalloutSelectionMode } from '@/core/apollo/generated/graphql-schema';
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
   * Card variant — required on purpose: TypeScript fails if a mount site
   * forgets to pass it. This callout renders in two places — the feed and the
   * post detail dialog — and both must agree.
   */
  cardVariant: 'compact' | 'expanded';
  /**
   * The callout's selection mode, passed in rather than selected by this
   * connector's own query: the callout settings have a single owner (the mount
   * site's `CalloutSettingsFull` selection), and a second partial `settings`
   * write would evict that cached, complete copy. Drives the pin indicator.
   */
  selectionMode: CalloutSelectionMode | undefined;
  className?: string;
};

export function SpaceCollectionConnector({
  calloutId,
  cardVariant,
  selectionMode,
  className,
}: SpaceCollectionConnectorProps) {
  const navigate = useNavigate();
  // The subspace cards need the lazily-loaded `crd-exploreSpaces` namespace, but they only
  // mount once the query resolves — suspending then would swap the already-rendered card
  // for its skeleton. Pull the namespace in here, while the card's boundary is still
  // showing the skeleton anyway (issue #10043).
  useTranslation('crd-exploreSpaces');
  const { subspaces, hasHiddenSpaces, loading } = useCrdSpaceSubspaces(
    calloutId,
    cardVariant === 'expanded',
    selectionMode
  );

  const handleSubspaceClick = (space: SpaceCardData) => navigate(space.href);

  return (
    <SpaceCollection
      className={className}
      subspaces={subspaces}
      hasHiddenSpaces={hasHiddenSpaces}
      loading={loading}
      variant={cardVariant}
      onSubspaceClick={handleSubspaceClick}
    />
  );
}
