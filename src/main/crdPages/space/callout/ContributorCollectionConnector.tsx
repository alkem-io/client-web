import { useEffect, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { ContributorCollection } from '@/crd/components/callout/ContributorCollection/ContributorCollection';
import type { ContributorTypeId } from '@/crd/forms/callout/types';
import { formatJoinedMonth } from '@/main/crdPages/space/dataMappers/contributorCollectionDataMapper';
import { useCrdSpaceContributors } from '@/main/crdPages/space/hooks/useCrdSpaceContributors';
import { useCrdSpaceLocale } from '@/main/crdPages/space/hooks/useCrdSpaceLocale';

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
  const {
    types,
    defaultType,
    defaultView,
    fixedView,
    counts,
    getCards,
    ensureLoaded,
    isLoading,
    loading,
    isCustomSelection,
  } = useCrdSpaceContributors(calloutId);

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

  // Render-time decoration only — never stored in state, so a live language
  // switch re-labels every already-loaded card without a new fetch.
  const locale = useCrdSpaceLocale();
  const cards = getCards(resolvedType)?.map(({ joinedDate, ...card }) => ({
    ...card,
    joinedMonthLabel: joinedDate ? formatJoinedMonth(joinedDate, locale) : undefined,
  }));

  return (
    <ContributorCollection
      className={className}
      types={types}
      activeType={resolvedType}
      onActiveTypeChange={handleActiveTypeChange}
      defaultView={defaultView}
      fixedView={fixedView}
      counts={counts}
      cards={cards}
      loading={loading || isLoading(resolvedType)}
      isCustomSelection={isCustomSelection}
      onContributorClick={href => navigate(href)}
    />
  );
}
