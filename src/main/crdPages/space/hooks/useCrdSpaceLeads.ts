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
 */
export function useCrdSpaceLeads(spaceId: string | undefined): LeadItem[] {
  const { data } = useSpaceAboutDetailsQuery({
    variables: { spaceId: spaceId ?? '' },
    skip: !spaceId,
  });
  const membership = data?.lookup.space?.about.membership;
  return mapSidebarLeads(membership?.leadUsers, membership?.leadOrganizations);
}
