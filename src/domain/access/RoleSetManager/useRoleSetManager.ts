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
import useRoleSetManagerRolesAssignment, {
  useRoleSetManagerRolesAssignmentProvided,
} from './RolesAssignament/useRoleSetManagerRolesAssignment';

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

interface useRoleSetManagerProvided extends useRoleSetManagerRolesAssignmentProvided {
  myPrivileges: AuthorizationPrivilege[] | undefined;
  roleNames: RoleName[] | undefined;

  /**
   * fetchContributors param should be true for these to be available
   */
  users: RoleSetMemberUserFragmentWithRoles[];
  organizations: RoleSetMemberOrganizationFragmentWithRoles[];
  virtualContributors: RoleSetMemberVirtualContributorFragmentWithRoles[];
  usersByRole: PartialRecord<RoleName, RoleSetMemberUserFragmentWithRoles[]>;
  organizationsByRole: PartialRecord<RoleName, RoleSetMemberOrganizationFragmentWithRoles[]>;
  virtualContributorsByRole: PartialRecord<RoleName, RoleSetMemberVirtualContributorFragmentWithRoles[]>;
  /**
   * fetchRoleDefinitions param should be true for this to be available
   */
  rolesDefinitions: Record<RoleName, RoleDefinition> | undefined;
  refetch: () => Promise<unknown>;
  loading: boolean;
  updating: boolean;
}

type useRoleSetManagerParams = {
  roleSetId: string | undefined;
  relevantRoles: readonly RoleName[];
  contributorTypes?: readonly RoleSetContributorType[];
  fetchContributors?: boolean;
  fetchRoleDefinitions?: boolean;
  onChange?: () => void;
  skip?: boolean;
};

const useRoleSetManager = ({
  roleSetId,
  relevantRoles,
  fetchContributors = false,
  fetchRoleDefinitions = false,
  contributorTypes = [RoleSetContributorType.User, RoleSetContributorType.Organization, RoleSetContributorType.Virtual],
  onChange,
  skip,
}: useRoleSetManagerParams): useRoleSetManagerProvided => {
  if (!roleSetId || !relevantRoles || relevantRoles.length === 0) {
    skip = true;
  }

  // TODO: Additional Auth Check
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
  const platformPrivileges = roleSetDetails?.platform.authorization?.myPrivileges;
  const myPrivileges = roleSetDetails?.lookup.roleSet?.authorization?.myPrivileges;

  const canReadRoleSet =
    (myPrivileges?.includes(AuthorizationPrivilege.Read) &&
      platformPrivileges?.includes(AuthorizationPrivilege.ReadUsers)) ??
    false;

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
      includeUsers: fetchContributors && contributorTypes.includes(RoleSetContributorType.User),
      includeOrganizations: fetchContributors && contributorTypes.includes(RoleSetContributorType.Organization),
      includeVirtualContributors: fetchContributors && contributorTypes.includes(RoleSetContributorType.Virtual),
      includeRoleDefinitions: fetchRoleDefinitions,
    },
    skip: skip || !canReadRoleSet || !roleSetId || loadingRoleSet || !relevantRoles || relevantRoles.length === 0,
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
      roleSetData?.lookup.roleSet?.roleDefinitions?.reduce((acc, roleDefinition) => {
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
      rolesDefinitions: fetchRoleDefinitions ? rolesDefinitions : undefined,
    };
  }, [roleSetData?.lookup]);

  const refetchAll = () => Promise.all([refetchRoleSet(), refetchRoleSetData(), onChange?.()]);

  // Wraps any function call into an await + onChange call, to perform a refetch outside here if needed
  const onMutationCall =
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
    assignRoleToOrganization,
    removeRoleFromOrganization,
    assignRoleToVirtualContributor,
    removeRoleFromVirtualContributor,
    loading: updatingRoleSet,
  } = useRoleSetManagerRolesAssignment({ roleSetId });

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

    assignRoleToUser: onMutationCall(assignRoleToUser),
    assignPlatformRoleToUser: onMutationCall(assignPlatformRoleToUser),
    assignRoleToOrganization: onMutationCall(assignRoleToOrganization),
    assignRoleToVirtualContributor: onMutationCall(assignRoleToVirtualContributor),
    removeRoleFromUser: onMutationCall(removeRoleFromUser),
    removePlatformRoleFromUser: onMutationCall(removePlatformRoleFromUser),
    removeRoleFromOrganization: onMutationCall(removeRoleFromOrganization),
    removeRoleFromVirtualContributor: onMutationCall(removeRoleFromVirtualContributor),
    updating: updatingRoleSet,
    refetch: refetchAll,
  };
};

export default useRoleSetManager;
