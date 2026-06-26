import { useEffect, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { ContributorCollection } from '@/crd/components/callout/ContributorCollection/ContributorCollection';
import type { ContributorTypeId } from '@/crd/forms/callout/types';
import { useCrdSpaceContributors } from '@/main/crdPages/space/hooks/useCrdSpaceContributors';

/**
 * Integration layer for a contributor-collection callout (feature 008). Owns the
 * active-type state, drives the lazy per-type fetch via `useCrdSpaceContributors`
 * (default type eager, others on first switch), and wires navigation. The CRD
 * `ContributorCollection` stays purely presentational.
 */

type ContributorCollectionConnectorProps = {
  calloutId: string;
  className?: string;
};

export function ContributorCollectionConnector({ calloutId, className }: ContributorCollectionConnectorProps) {
  const navigate = useNavigate();
  const { types, defaultType, defaultView, counts, getCards, ensureLoaded, isLoading, loading } =
    useCrdSpaceContributors(calloutId);

  const [activeType, setActiveType] = useState<ContributorTypeId | null>(null);

  // Open on the configured default type once the config resolves.
  useEffect(() => {
    if (!activeType && !loading && types.length > 0) {
      setActiveType(defaultType);
    }
  }, [activeType, loading, types, defaultType]);

  const resolvedType = activeType ?? defaultType;

  const handleActiveTypeChange = (type: ContributorTypeId) => {
    setActiveType(type);
    ensureLoaded(type); // lazy-fetch this type's full set once (FR-008)
  };

  return (
    <ContributorCollection
      className={className}
      types={types}
      activeType={resolvedType}
      onActiveTypeChange={handleActiveTypeChange}
      defaultView={defaultView}
      counts={counts}
      cards={getCards(resolvedType)}
      loading={loading || isLoading(resolvedType)}
      onContributorClick={href => navigate(href)}
    />
  );
}
