import { useRoleSetAuthorizationQuery, useRoleSetRoleAssignmentQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, RoleName, RoleSetMemberOrganizationFragment, RoleSetMemberUserFragment, RoleSetMemberVirtualContributorFragment } from '@/core/apollo/generated/graphql-schema';
import { useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

interface RoleSetMemberUserFragmentWithRoles extends RoleSetMemberUserFragment {
  roles: RoleName[];
  isContactable: boolean;
}

interface RoleSetMemberOrganizationFragmentWithRoles extends RoleSetMemberOrganizationFragment {
  roles: RoleName[];
  isContactable: boolean;
}

interface RoleSetMemberVirtualContributorFragmentWithRoles extends RoleSetMemberVirtualContributorFragment {
  roles: RoleName[];
  isContactable: boolean;
}

type useRoleSetAdminProvided = {
  myPrivileges: AuthorizationPrivilege[] | undefined;
  roleNames: RoleName[] | undefined;
  getUsersWithRole: (role?: RoleName) => RoleSetMemberUserFragmentWithRoles[];
  getOrganizationsWithRole: (role?: RoleName) => RoleSetMemberOrganizationFragmentWithRoles[];
  getVirtualContributorsWithRole: (role?: RoleName) => RoleSetMemberVirtualContributorFragmentWithRoles[];
  loading: boolean;
};

type useRoleSetAdminParams = {
  roleSetId: string;
  relevantRoles: RoleName[];
  parentRoleSetId?: string;
  skip?: boolean;
}

const useRoleSetAdmin = ({ roleSetId, relevantRoles, parentRoleSetId, skip }: useRoleSetAdminParams): useRoleSetAdminProvided => {
  if (!roleSetId || !relevantRoles || relevantRoles.length === 0) {
    skip = true;
  }

  const {
    data: roleSetDetails,
    loading: loadingRoleSet,
    refetch: refetchRoleSet,
  } = useRoleSetAuthorizationQuery({
    variables: {
      roleSetId,
    },
    skip: skip || !roleSetId,
  });

  const myPrivileges = roleSetDetails?.lookup.roleSet?.authorization?.myPrivileges;

  const validRoles = roleSetDetails?.lookup.roleSet?.roleNames;
  if (!skip && !loadingRoleSet && validRoles) {
    if (relevantRoles.some(role => !validRoles.includes(role))) {
      throw new Error(`RoleSet ${roleSetId} doesn't provide specified role ${relevantRoles.join(',')} != ${validRoles.join(',')}`);
    }
  }

  const {
    data: roleSetData,
    loading: loadingRoleSetData,
    refetch: refetchRoleSetData,
  } = useRoleSetRoleAssignmentQuery({
    variables: {
      roleSetId,
      roles: relevantRoles!
    },
    skip: skip || loadingRoleSet || !relevantRoles || relevantRoles.length === 0,
  });

  const data = useMemo(() => {
    const roleSet = roleSetData?.lookup.roleSet;

    const usersById: Record<string, RoleSetMemberUserFragmentWithRoles> = {};
    const organizationsById: Record<string, RoleSetMemberOrganizationFragmentWithRoles> = {};
    const virtualContributorsById: Record<string, RoleSetMemberVirtualContributorFragmentWithRoles> = {};

    roleSet?.usersInRoles.forEach(usersInRole => {
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

    roleSet?.organizationsInRoles.forEach(organizationsInRole => {
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

    roleSet?.virtualContributorsInRoles.forEach(virtualContributorsInRole => {
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
      organizationsByRole[role] = Object.values(organizationsById).filter(organization => organization.roles.includes(role));
      virtualContributorsByRole[role] = Object.values(virtualContributorsById).filter(virtualContributor => virtualContributor.roles.includes(role));
    }
    return {
      usersById,
      organizationsById,
      virtualContributorsById,
      usersByRole,
      organizationsByRole,
      virtualContributorsByRole
    };
  }, [roleSetData]);

  const getUsersWithRole = (role?: RoleName) =>
    role ? data.usersByRole[role] ?? [] : Object.values(data.usersById);

  const getOrganizationsWithRole = (role?: RoleName) =>
    role ? data.organizationsByRole[role] ?? [] : Object.values(data.organizationsById);

  const getVirtualContributorsWithRole = (role?: RoleName) =>
    role ? data.virtualContributorsByRole[role] ?? [] : Object.values(data.virtualContributorsById);


  return {
    myPrivileges,
    roleNames: validRoles,
    loading: loadingRoleSet || loadingRoleSetData,
    getUsersWithRole,
    getOrganizationsWithRole,
    getVirtualContributorsWithRole,
  }

}