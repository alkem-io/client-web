import { LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import { pageSpace } from '@/domain/space/context/spacePageShellMapper';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSpacePageData, useSpaceVirtualContributors } from '@/domain/space/hooks/useSpacePage';
import {
  mapRoleSetMemberToSidebarLead,
  mapVirtualContributorToSidebar,
  type SidebarLeadData,
  type SidebarVirtualContributorData,
} from '../dataMappers/communityDataMapper';
import { actorProfile, actorsOfType, nativeGuidelines } from '../dataMappers/spacePageDataMapper';

type UseCrdSpaceCommunityParams = {
  /** Suppresses the contributor-roster fetch (roleSet leads + virtual
   *  contributors). The sidebar connector passes this when NEITHER
   *  contactLeads NOR virtualContributors is configured on the active tab
   *  (FR-019) — those two widgets genuinely share this one query. */
  skipContributors?: boolean;
  /** Suppresses the community-guidelines content fetch — gated solely on the
   *  `guidelines` widget's presence. */
  skipGuidelines?: boolean;
};

export function useCrdSpaceCommunity({ skipContributors, skipGuidelines }: UseCrdSpaceCommunityParams = {}) {
  const { space, permissions, entitlements } = useSpace();

  const roleSetId = space.about.membership?.roleSetID;
  // 021 F045/F047/F048: leads and guidelines from the page's D2 Space document, read from the cache, so the widgets
  // add no request; the VC members are their widget's members read (SpaceVirtualContributors).
  const spaceId = space.id || undefined;
  const doc = pageSpace(useSpacePageData(spaceId, 'space')?.node, spaceId);
  const leads = skipContributors ? undefined : doc?.leads;

  const leadUsers: SidebarLeadData[] = actorsOfType(leads, 'user')
    .map(u => mapRoleSetMemberToSidebarLead(u, 'person'))
    .filter((l): l is SidebarLeadData => l !== undefined);

  const leadOrganizations: SidebarLeadData[] = actorsOfType(leads, 'organization')
    .map(o => mapRoleSetMemberToSidebarLead(o, 'org'))
    .filter((l): l is SidebarLeadData => l !== undefined);

  // Sidebar VCs — only rendered (and read) when the space has the VC entitlement; the list continues past its first page
  // with no control (S23-LIST-PAGE-500).
  const hasVcEntitlement = entitlements?.includes(LicenseEntitlementType.SpaceFlagVirtualContributorAccess) ?? false;
  const { members: vcs, notServed: vcsNotServed } = useSpaceVirtualContributors(
    skipContributors || !hasVcEntitlement ? undefined : spaceId
  );

  const virtualContributors: SidebarVirtualContributorData[] = (vcs?.edges ?? [])
    .map(edge => mapVirtualContributorToSidebar(actorProfile(edge.node.actor)))
    .filter((vc): vc is SidebarVirtualContributorData => vc !== undefined);

  const guidelinesJson = skipGuidelines ? undefined : nativeGuidelines(doc);
  const guidelines = {
    id: space.about.guidelines?.id || undefined,
    displayName: guidelinesJson?.displayName,
    description: guidelinesJson?.description,
    references: [],
    loading: false,
  };

  return {
    leadUsers,
    leadOrganizations,
    virtualContributors,
    /** The server does not serve the VC members read yet: the widget says so in place. */
    virtualContributorsUnavailable: vcsNotServed,
    hasVcEntitlement,
    guidelines,
    roleSetId,
    communityId: space.about.membership?.communityID,
    canInvite: permissions.canUpdate,
    loading: !skipContributors && !doc,
  };
}
