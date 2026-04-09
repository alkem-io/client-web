import { ActorType, RoleName } from '@/core/apollo/generated/graphql-schema';
import type { MemberCardData } from '@/crd/components/space/SpaceMembers';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { useSpace } from '@/domain/space/context/useSpace';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';
import { mapRoleSetToMemberCards } from '../dataMappers/communityDataMapper';

export function useCrdSpaceCommunity() {
  const { space, permissions } = useSpace();

  const {
    calloutsSetId,
    classificationTagsets,
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
  // role/roleType for the UI badge.
  const {
    users,
    organizations,
    loading: roleSetLoading,
  } = useRoleSetManager({
    roleSetId,
    relevantRoles: [RoleName.Admin, RoleName.Lead, RoleName.Member],
    contributorTypes: [ActorType.User, ActorType.Organization],
    fetchContributors: true,
  });

  const members: MemberCardData[] = mapRoleSetToMemberCards(users, organizations);
  const usersCount = users.length;
  const organizationsCount = organizations.length;

  const leadUsers = space.about.membership?.leadUsers ?? [];
  const guidelines = space.about.guidelines;

  return {
    callouts: calloutsSetProvided.callouts ?? [],
    calloutsSetId,
    canCreateCallout: calloutsSetProvided.canCreateCallout,
    tabDescription: tabDescription ?? '',
    leadUsers,
    guidelines,
    members,
    usersCount,
    organizationsCount,
    roleSetId,
    communityId: space.about.membership?.communityID,
    canInvite: permissions.canUpdate,
    loading: tabLoading || calloutsSetProvided.loading || roleSetLoading,
  };
}
