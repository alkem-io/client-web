import { useTranslation } from 'react-i18next';
import { CalloutSelectionMode } from '@/core/apollo/generated/graphql-schema';
import { MembershipStatus, type PostBodyFragment } from '@/core/apollo/generated-v2/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { SpaceCollection } from '@/crd/components/callout/SpaceCollection/SpaceCollection';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { useCachedPost } from '@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails';
import { nativeSubspaceCard } from '@/main/crdPages/space/dataMappers/subspaceCardDataMapper';

type SpacesContent = Extract<NonNullable<PostBodyFragment['content']>, { __typename: 'SpacesContent' }>;

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
  // 021 F081-F099: the spaces arrive in the post's own SpacesContent; pinned first, then by name, as legacy
  // (the pinned spaces' own sort order is not served, so they too go by name).
  const post = useCachedPost(calloutId);
  const content = post?.contentKind === 'spaces' ? (post.content as SpacesContent | null) : undefined;
  const isCustom = selectionMode === CalloutSelectionMode.Custom;
  const spaces = [...(content?.spaces ?? [])].sort(
    (a, b) =>
      Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || a.about.displayName.localeCompare(b.about.displayName)
  );
  const subspaces = spaces.map(space =>
    nativeSubspaceCard(
      {
        ...space,
        membership: { roles: space.membership?.status === MembershipStatus.Member ? ['member'] : [] },
        can: { read: true },
      },
      !isCustom
    )
  );
  const hasHiddenSpaces = content?.hasHiddenSpaces ?? false;
  const loading = !post;

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
