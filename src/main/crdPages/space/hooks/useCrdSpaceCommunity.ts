import { useCommunityGuidelinesQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  ActorType,
  AuthorizationPrivilege,
  LicenseEntitlementType,
  RoleName,
  SearchVisibility,
} from '@/core/apollo/generated/graphql-schema';
import type { MemberCardData } from '@/crd/components/space/SpaceMembers';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { useSpace } from '@/domain/space/context/useSpace';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';
import {
  mapRoleSetMemberToSidebarLead,
  mapRoleSetToMemberCards,
  mapVirtualContributorToSidebar,
  type SidebarLeadData,
  type SidebarVirtualContributorData,
} from '../dataMappers/communityDataMapper';

export function useCrdSpaceCommunity() {
  const { space, permissions, entitlements } = useSpace();

  const {
    calloutsSetId,
    classificationTagsets,
    flowStateForNewCallouts,
    tabDescription,
    loading: tabLoading,
  } = useSpaceTabProvider({ tabPosition: 1 });

  const calloutsSetProvided = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
  });

  const roleSetId = space.about.membership?.roleSetID;

  // Fetch contributors across all relevant roles. The flat `users` /
  // `organizations` arrays are deduplicated across roles, and each entry
  // carries its full `roles` list, which the mapper uses to derive
  // role/roleType for the UI badge. The per-role `usersByRole[Lead]` +
  // `organizationsByRole[Lead]` feeds the sidebar lead block, and
  // `virtualContributorsByRole[Member]` feeds the sidebar VC section.
  const {
    users,
    organizations,
    usersByRole,
    organizationsByRole,
    virtualContributorsByRole,
    loading: roleSetLoading,
  } = useRoleSetManager({
    roleSetId,
    relevantRoles: [RoleName.Admin, RoleName.Lead, RoleName.Member],
    contributorTypes: [ActorType.User, ActorType.Organization, ActorType.VirtualContributor],
    fetchContributors: true,
  });

  const members: MemberCardData[] = mapRoleSetToMemberCards(users, organizations);

  // Sidebar leads (users + organizations with the Lead role)
  const leadUsers: SidebarLeadData[] = (usersByRole[RoleName.Lead] ?? [])
    .map(u => mapRoleSetMemberToSidebarLead(u, 'person'))
    .filter((l): l is SidebarLeadData => l !== undefined);

  const leadOrganizations: SidebarLeadData[] = (organizationsByRole[RoleName.Lead] ?? [])
    .map(o => mapRoleSetMemberToSidebarLead(o, 'org'))
    .filter((l): l is SidebarLeadData => l !== undefined);

  // Sidebar VCs (hidden-search VCs filtered out) — only rendered when the
  // space has the VC entitlement.
  const hasVcEntitlement = entitlements?.includes(LicenseEntitlementType.SpaceFlagVirtualContributorAccess) ?? false;

  const virtualContributors: SidebarVirtualContributorData[] = (virtualContributorsByRole[RoleName.Member] ?? [])
    .filter(vc => vc?.searchVisibility !== SearchVisibility.Hidden)
    .map(mapVirtualContributorToSidebar)
    .filter((vc): vc is SidebarVirtualContributorData => vc !== undefined);

  // Community guidelines (markdown title + description + references) for the
  // sidebar block. The SpaceContext only carries the id, so fetch the content.
  const guidelinesId = space.about.guidelines?.id || undefined;
  const { data: guidelinesData, loading: guidelinesLoading } = useCommunityGuidelinesQuery({
    variables: { communityGuidelinesId: guidelinesId ?? '' },
    skip: !guidelinesId,
  });
  const guidelinesProfile = guidelinesData?.lookup.communityGuidelines?.profile;
  const guidelines = {
    id: guidelinesId,
    displayName: guidelinesProfile?.displayName,
    description: guidelinesProfile?.description ?? undefined,
    references: (guidelinesProfile?.references ?? []).map(r => ({
      name: r.name,
      uri: r.uri,
      description: r.description ?? undefined,
    })),
    loading: guidelinesLoading,
  };

  return {
    callouts: calloutsSetProvided.callouts ?? [],
    calloutsSetId,
    canCreateCallout: calloutsSetProvided.canCreateCallout,
    canReorderCallouts:
      calloutsSetProvided.calloutsSetAuthorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false,
    tabDescription: tabDescription ?? '',
    flowStateForNewCallouts,
    leadUsers,
    leadOrganizations,
    virtualContributors,
    hasVcEntitlement,
    guidelines,
    members,
    roleSetId,
    communityId: space.about.membership?.communityID,
    canInvite: permissions.canUpdate,
    loading: tabLoading || calloutsSetProvided.loading || roleSetLoading,
  };
}
