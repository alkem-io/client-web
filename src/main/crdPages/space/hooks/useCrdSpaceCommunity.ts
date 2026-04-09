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

  const {
    usersByRole,
    organizationsByRole,
    loading: roleSetLoading,
  } = useRoleSetManager({
    roleSetId,
    relevantRoles: [RoleName.Member, RoleName.Lead],
    contributorTypes: [ActorType.User, ActorType.Organization],
    fetchContributors: true,
  });

  const memberUsers = usersByRole[RoleName.Member] ?? [];
  const memberOrganizations = organizationsByRole[RoleName.Member] ?? [];
  const members: MemberCardData[] = mapRoleSetToMemberCards(memberUsers, memberOrganizations);

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
    roleSetId,
    communityId: space.about.membership?.communityID,
    canInvite: permissions.canUpdate,
    loading: tabLoading || calloutsSetProvided.loading || roleSetLoading,
  };
}
