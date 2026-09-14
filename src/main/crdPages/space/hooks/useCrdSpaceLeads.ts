import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import type { LeadItem } from '@/crd/components/space/sidebar/InfoBlock';
import { mapSidebarLeads } from '../dataMappers/spacePageDataMapper';

/**
 * Fetches lead users + lead organizations for the L0 sidebar info block.
 *
 * `SpaceContext` only loads the lightweight `SpaceAboutLight` fragment, which
 * does not include `leadUsers` / `leadOrganizations`. The full
 * `useSpaceAboutDetailsQuery` is the canonical source. Apollo dedupes against
 * any other consumer (e.g. the L1 layout fetching the parent's about).
 *
 * `skip: true` suppresses the query — the sidebar connector passes this when
 * the `intent` widget is not configured on the active tab (FR-019).
 *
 * `loading` lets the info block hold the leads row's footprint until the query
 * lands, instead of growing when it does (issue #10043).
 */
export function useCrdSpaceLeads(spaceId: string | undefined, skip?: boolean): { leads: LeadItem[]; loading: boolean } {
  const { data, loading } = useSpaceAboutDetailsQuery({
    variables: { spaceId: spaceId ?? '' },
    skip: skip || !spaceId,
  });
  const membership = data?.lookup.space?.about.membership;
  return { leads: mapSidebarLeads(membership?.leadUsers, membership?.leadOrganizations), loading };
}
