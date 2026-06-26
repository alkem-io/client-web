import { useEffect, useRef, useState } from 'react';
import {
  useContributorCollectionByTypeLazyQuery,
  useContributorCollectionConfigQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { ContributorType } from '@/core/apollo/generated/graphql-schema';
import type { ContributorCardData } from '@/crd/components/callout/ContributorCollection/ContributorCard';
import type { ContributorCollectionCounts } from '@/crd/components/callout/ContributorCollection/ContributorCollection';
import type { ContributorTypeId, ContributorViewId } from '@/crd/forms/callout/types';
import {
  contributorCollectionFromServer,
  contributorTypeFromServer,
  contributorTypeToServer,
} from '@/main/crdPages/space/callout/contributorCollectionMapper';
import { mapContributorItemToCard } from '../dataMappers/contributorCollectionDataMapper';

/**
 * Data layer for a contributor-collection callout (feature 008, T004).
 *
 * - Eager: fetches the callout config (selected types, default type, default
 *   view) + per-type counts once on mount (`ContributorCollectionConfig`), and
 *   eagerly loads the **default** type's FULL authorized set.
 * - Lazy: other selected types are fetched on demand — once each — via
 *   `useLazyQuery`, keyed on type alone (search + pagination are client-side, so
 *   the cache key never needs to change). The same fetched set feeds both the
 *   list (client-paginated) and the map (plotted).
 *
 * The server returns the full authorized set per type (no server pagination or
 * search); the consumer paginates/searches client-side.
 */

export type UseCrdSpaceContributorsResult = {
  /** Selected contributor types (>=1) in display order, from the callout config. */
  types: ContributorTypeId[];
  /** The default type (segment shown first). */
  defaultType: ContributorTypeId;
  /** The default display mode from the callout config. */
  defaultView: ContributorViewId;
  /** Always-visible per-type counts (total eligible set). */
  counts: ContributorCollectionCounts;
  /** Cards for the requested type, or `undefined` until that type is fetched. */
  getCards: (type: ContributorTypeId) => ContributorCardData[] | undefined;
  /** Trigger a one-time lazy fetch of the given type's full set (no-op if already loaded/loading). */
  ensureLoaded: (type: ContributorTypeId) => void;
  /** Whether the given type's set is currently loading. */
  isLoading: (type: ContributorTypeId) => boolean;
  /** Config query loading state. */
  loading: boolean;
};

const EMPTY_COUNTS: ContributorCollectionCounts = { users: 0, organizations: 0, virtualContributors: 0 };

export function useCrdSpaceContributors(calloutId: string | undefined): UseCrdSpaceContributorsResult {
  const { data: configData, loading } = useContributorCollectionConfigQuery({
    variables: { calloutId: calloutId ?? '' },
    skip: !calloutId,
  });

  const framing = configData?.lookup.callout?.framing;
  const config = contributorCollectionFromServer(
    configData?.lookup.callout?.settings.framing.contributors ?? undefined
  );
  const counts: ContributorCollectionCounts = framing?.contributorCounts
    ? {
        users: framing.contributorCounts.users,
        organizations: framing.contributorCounts.organizations,
        virtualContributors: framing.contributorCounts.virtualContributors,
      }
    : EMPTY_COUNTS;

  // Per-type fetched card sets. `requestedRef` tracks which types have already
  // been fetched (a ref, not state, so `ensureLoaded` reads a fresh value without
  // a render cycle and the eager-load effect stays free of function deps).
  const [cardsByType, setCardsByType] = useState<Partial<Record<ContributorTypeId, ContributorCardData[]>>>({});
  const [loadingTypes, setLoadingTypes] = useState<Set<ContributorTypeId>>(new Set());
  const requestedRef = useRef<Set<ContributorTypeId>>(new Set());

  const [fetchByType] = useContributorCollectionByTypeLazyQuery();

  const ensureLoaded = (type: ContributorTypeId) => {
    if (!calloutId || requestedRef.current.has(type)) return;
    requestedRef.current.add(type);
    setLoadingTypes(prev => new Set(prev).add(type));
    const serverType = contributorTypeToServer(type);
    void fetchByType({ variables: { calloutId, type: serverType } })
      .then(result => {
        const items = result.data?.lookup.callout?.framing.contributors ?? [];
        setCardsByType(prev => ({ ...prev, [type]: items.map(mapContributorItemToCard) }));
      })
      .catch(() => {
        // Roll back so a later switch can retry — otherwise a failed fetch would
        // leave the type marked "requested" forever and the user stuck on empty.
        requestedRef.current.delete(type);
      })
      .finally(() => {
        setLoadingTypes(prev => {
          const next = new Set(prev);
          next.delete(type);
          return next;
        });
      });
  };

  // Eager-load the default type once the config resolves (R2 — only the default
  // type's data is fetched on load; others are fetched on switch). `ensureLoaded`
  // is idempotent via `requestedRef`, so re-running is a no-op once loaded.
  const hasConfig = Boolean(calloutId) && !loading && Boolean(framing);
  const defaultType = config.defaultType;
  useEffect(() => {
    if (hasConfig) ensureLoaded(defaultType);
  }, [hasConfig, defaultType, ensureLoaded]);

  return {
    types: config.types,
    defaultType,
    defaultView: config.defaultView,
    counts,
    getCards: (type: ContributorTypeId) => cardsByType[type],
    ensureLoaded,
    isLoading: (type: ContributorTypeId) => loadingTypes.has(type),
    loading,
  };
}

/** Re-export for consumers that need the server enum bridge in one place. */
export { contributorTypeFromServer, ContributorType };
