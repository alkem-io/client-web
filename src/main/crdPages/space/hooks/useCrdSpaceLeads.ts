import type { LeadItem } from '@/crd/components/space/sidebar/InfoBlock';
import { pageSpace } from '@/domain/space/context/spacePageShellMapper';
import { useSpacePageData } from '@/domain/space/hooks/useSpacePage';
import { actorsOfType, mapSidebarLeads } from '../dataMappers/spacePageDataMapper';

/**
 * Lead users + lead organizations for the L0 sidebar info block, read from the page's D2 Space document
 * (`leads`, split by actorType, users first). No request of its own.
 *
 * `skip: true` reads nothing — the sidebar connector passes this when the `intent` widget is not configured on the
 * active tab (FR-019). `loading` holds the leads row's footprint until the document lands (issue #10043).
 */
export function useCrdSpaceLeads(spaceId: string | undefined, skip?: boolean): { leads: LeadItem[]; loading: boolean } {
  const id = skip ? undefined : spaceId;
  const space = pageSpace(useSpacePageData(id, 'space')?.node, id);
  const leads = mapSidebarLeads(actorsOfType(space?.leads, 'user'), actorsOfType(space?.leads, 'organization'));
  return { leads, loading: Boolean(id) && !space };
}
