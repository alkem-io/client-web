import { useMemo } from 'react';
import { PartialRecord } from '@/core/utils/PartialRecords';
import { useRoleSetAuthorizationQuery, useRoleSetRoleAssignmentQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  RoleName,
  RoleSetContributorType,
  RoleSetMemberOrganizationFragment,
  RoleSetMemberUserFragment,
  RoleSetMemberVirtualContributorFragment,
} from '@/core/apollo/generated/graphql-schema';
import useRoleSetAdminRolesAssignment, {
  useRoleSetAdminRolesAssignmentProvided,
} from './RolesAssignament/useRoleSetAdminRolesAssignment';

export const RELEVANT_ROLES = {
  Community: [RoleName.Admin, RoleName.Lead, RoleName.Member],
  Organization: [RoleName.Owner, RoleName.Admin, RoleName.Associate],
  Platform: [
    RoleName.GlobalAdmin,
    RoleName.GlobalSupport,
    RoleName.GlobalLicenseManager,
    RoleName.GlobalCommunityReader,
    RoleName.GlobalSpacesReader,
    RoleName.PlatformBetaTester,
    RoleName.PlatformVcCampaign,
  ],
} as const;

type RoleDefinition = {
  name: RoleName;
  organizationPolicy: {
    minimum: number;
    maximum: number;
  };
  userPolicy: {
    minimum: number;
    maximum: number;
  };
};

export interface RoleSetMemberUserFragmentWithRoles extends RoleSetMemberUserFragment {
  roles: RoleName[];
  isContactable: boolean;
}

export interface RoleSetMemberOrganizationFragmentWithRoles extends RoleSetMemberOrganizationFragment {
  roles: RoleName[];
  isContactable: boolean;
}

export interface RoleSetMemberVirtualContributorFragmentWithRoles extends RoleSetMemberVirtualContributorFragment {
  roles: RoleName[];
  isContactable: boolean;
}

interface useRoleSetAdminProvided extends useRoleSetAdminRolesAssignmentProvided {
  myPrivileges: AuthorizationPrivilege[] | undefined;
  roleNames: RoleName[] | undefined;

  users: RoleSetMemberUserFragmentWithRoles[];
  organizations: RoleSetMemberOrganizationFragmentWithRoles[];
  virtualContributors: RoleSetMemberVirtualContributorFragmentWithRoles[];
  usersByRole: PartialRecord<RoleName, RoleSetMemberUserFragmentWithRoles[]>;
  organizationsByRole: PartialRecord<RoleName, RoleSetMemberOrganizationFragmentWithRoles[]>;
  virtualContributorsByRole: PartialRecord<RoleName, RoleSetMemberVirtualContributorFragmentWithRoles[]>;
  rolesDefinitions: Record<RoleName, RoleDefinition> | undefined;
  refetch: () => Promise<unknown>;
  loading: boolean;
  updating: boolean;
}

type useRoleSetAdminParams = {
  roleSetId: string | undefined;
  relevantRoles: readonly RoleName[];
  contributorTypes?: readonly RoleSetContributorType[];
  parentRoleSetId?: string;
  onRefetch?: () => void;
  skip?: boolean;
};

const useRoleSetAdmin = ({
  roleSetId,
  relevantRoles,
  contributorTypes = [RoleSetContributorType.User, RoleSetContributorType.Organization, RoleSetContributorType.Virtual],
  onRefetch,
  skip,
}: useRoleSetAdminParams): useRoleSetAdminProvided => {
  if (!roleSetId || !relevantRoles || relevantRoles.length === 0) {
    skip = true;
  }

  const {
    data: roleSetDetails,
    loading: loadingRoleSet,
    refetch: refetchRoleSet,
  } = useRoleSetAuthorizationQuery({
    variables: {
      roleSetId: roleSetId!,
    },
    skip: skip || !roleSetId,
  });

  const myPrivileges = roleSetDetails?.lookup.roleSet?.authorization?.myPrivileges;

  const validRoles = roleSetDetails?.lookup.roleSet?.roleNames;
  if (!skip && !loadingRoleSet && validRoles) {
    if (relevantRoles.some(role => !validRoles.includes(role))) {
      throw new Error(
        `RoleSet ${roleSetId} doesn't provide specified role ${relevantRoles.join(',')} != ${validRoles.join(',')}`
      );
    }
  }

  const {
    data: roleSetData,
    loading: loadingRoleSetData,
    refetch: refetchRoleSetData,
  } = useRoleSetRoleAssignmentQuery({
    variables: {
      roleSetId: roleSetId!,
      roles: relevantRoles as RoleName[],
      includeUsers: contributorTypes.includes(RoleSetContributorType.User),
      includeOrganizations: contributorTypes.includes(RoleSetContributorType.Organization),
      includeVirtualContributors: contributorTypes.includes(RoleSetContributorType.Virtual),
    },
    skip: skip || !roleSetId || loadingRoleSet || !relevantRoles || relevantRoles.length === 0,
  });

  const data = useMemo(() => {
    const roleSet = roleSetData?.lookup.roleSet;

    const usersById: Record<string, RoleSetMemberUserFragmentWithRoles> = {};
    const organizationsById: Record<string, RoleSetMemberOrganizationFragmentWithRoles> = {};
    const virtualContributorsById: Record<string, RoleSetMemberVirtualContributorFragmentWithRoles> = {};

    roleSet?.usersInRoles?.forEach(usersInRole => {
      usersInRole.users.forEach(user => {
        if (usersById[user.id]) {
          usersById[user.id].roles.push(usersInRole.role);
        } else {
          usersById[user.id] = {
            ...user,
            roles: [usersInRole.role],
          };
        }
      });
    });

    roleSet?.organizationsInRoles?.forEach(organizationsInRole => {
      organizationsInRole.organizations.forEach(organization => {
        if (organizationsById[organization.id]) {
          organizationsById[organization.id].roles.push(organizationsInRole.role);
        } else {
          organizationsById[organization.id] = {
            ...organization,
            roles: [organizationsInRole.role],
            isContactable: false,
          };
        }
      });
    });

    roleSet?.virtualContributorsInRoles?.forEach(virtualContributorsInRole => {
      virtualContributorsInRole.virtualContributors.forEach(virtualContributor => {
        if (virtualContributorsById[virtualContributor.id]) {
          virtualContributorsById[virtualContributor.id].roles.push(virtualContributorsInRole.role);
        } else {
          virtualContributorsById[virtualContributor.id] = {
            ...virtualContributor,
            roles: [virtualContributorsInRole.role],
            isContactable: false,
          };
        }
      });
    });

    const usersByRole: PartialRecord<RoleName, RoleSetMemberUserFragmentWithRoles[]> = {};
    const organizationsByRole: PartialRecord<RoleName, RoleSetMemberOrganizationFragmentWithRoles[]> = {};
    const virtualContributorsByRole: PartialRecord<RoleName, RoleSetMemberVirtualContributorFragmentWithRoles[]> = {};

    for (const role of relevantRoles) {
      usersByRole[role] = Object.values(usersById).filter(user => user.roles.includes(role));
      organizationsByRole[role] = Object.values(organizationsById).filter(organization =>
        organization.roles.includes(role)
      );
      virtualContributorsByRole[role] = Object.values(virtualContributorsById).filter(virtualContributor =>
        virtualContributor.roles.includes(role)
      );
    }

    const rolesDefinitions: Record<RoleName, RoleDefinition> | undefined =
      roleSetData?.lookup.roleSet?.roleDefinitions.reduce((acc, roleDefinition) => {
        acc[roleDefinition.name] = roleDefinition;
        return acc;
      }, {} as Record<RoleName, RoleDefinition>);

    return {
      users: Object.values(usersById),
      organizations: Object.values(organizationsById),
      virtualContributors: Object.values(virtualContributorsById),
      usersById,
      organizationsById,
      virtualContributorsById,
      usersByRole,
      organizationsByRole,
      virtualContributorsByRole,
      rolesDefinitions,
    };
  }, [roleSetData?.lookup]);

  const refetchAll = () => Promise.all([refetchRoleSet(), refetchRoleSetData(), onRefetch?.()]);

  // Wraps any function call into an await + refetch
  const refetchAfterMutation =
    (mutation: (...args) => Promise<unknown>) =>
    async (...args) => {
      await mutation(...args);
      refetchAll();
    };

  const {
    assignRoleToUser,
    removeRoleFromUser,
    assignPlatformRoleToUser,
    removePlatformRoleFromUser,
    loading: updatingRoleSet,
  } = useRoleSetAdminRolesAssignment({ roleSetId });

  /*

  const {
    data: dataApplications,
    loading: loadingApplications,
    refetch: refetchApplicationsAndInvitations,
  } = useCommunityApplicationsInvitationsQuery({
    variables: { roleSetId },
    skip: !roleSetId,
  });
*/
  return {
    myPrivileges,
    roleNames: validRoles,
    loading: loadingRoleSet || loadingRoleSetData,

    users: data.users,
    organizations: data.organizations,
    virtualContributors: data.virtualContributors,
    usersByRole: data.usersByRole,
    organizationsByRole: data.organizationsByRole,
    virtualContributorsByRole: data.virtualContributorsByRole,
    rolesDefinitions: data.rolesDefinitions,

    assignRoleToUser: refetchAfterMutation(assignRoleToUser),
    assignPlatformRoleToUser: refetchAfterMutation(assignPlatformRoleToUser),
    removeRoleFromUser: refetchAfterMutation(removeRoleFromUser),
    removePlatformRoleFromUser: refetchAfterMutation(removePlatformRoleFromUser),
    updating: updatingRoleSet,
    refetch: refetchAll,
  };
};

export default useRoleSetAdmin;
