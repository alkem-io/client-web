import { useRoleSetAuthorizationQuery, useRoleSetRoleAssignmentQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  ActorType,
  AuthorizationPrivilege,
  RoleName,
  type RoleSetMemberOrganizationFragment,
  type RoleSetMemberUserFragment,
  type RoleSetMemberVirtualContributorFragment,
} from '@/core/apollo/generated/graphql-schema';
import type { PartialRecord } from '@/core/utils/PartialRecord';
import type { RoleDefinition } from '../model/RoleDefinitionModel';
import useRoleSetManagerRolesAssignment, {
  type useRoleSetManagerRolesAssignmentProvided,
} from './RolesAssignment/useRoleSetManagerRolesAssignment';

// The 10 `Platform …` administration roles — assignable only by a holder of
// `GRANT_GLOBAL_ADMINS` (Slice A spelling of `PLATFORM_ROLES_ASSIGN`, FR-012).
const PLATFORM_ADMIN_ROLES = [
  RoleName.PlatformRolesAdmin,
  RoleName.PlatformContentFullAccess,
  RoleName.PlatformResourceAdmin,
  RoleName.PlatformSettingsAdmin,
  RoleName.PlatformOperationsAdmin,
  RoleName.PlatformUsersAdmin,
  RoleName.PlatformSupport,
  RoleName.PlatformLicenseManager,
  RoleName.PlatformSpacesReader,
  RoleName.PlatformAuditReader,
] as const;

// The 3 `Feature …` roles — assignable by a holder of `FEATURE_ROLE_ASSIGN`
// (Platform Users Admin) or by anyone who can assign the full Platform set.
const FEATURE_ROLES = [
  RoleName.FeatureBetaTester,
  RoleName.FeatureVirtualAssistant,
  RoleName.FeatureOrganizationCreator,
] as const;

export const RELEVANT_ROLES = {
  Community: [RoleName.Admin, RoleName.Lead, RoleName.Member],
  Organization: [RoleName.Owner, RoleName.Admin, RoleName.Associate],
  Platform: [...PLATFORM_ADMIN_ROLES, ...FEATURE_ROLES],
} as const;

/**
 * FR-012: which role *set* an operator may offer/assign, read from `myPrivileges`
 * on the platform role-set. This is the **only** client-side authorization
 * decision this feature makes — no assignment rule (holder kind, spaces-reader,
 * audit-reader exclusion, last-roles-admin) is reimplemented here. The server
 * remains the sole enforcement point; this filter only decides what to *offer*
 * and, as a consequence, keeps the holder-list read from ever spanning both
 * role sets in one request (FR-032).
 */
export const getOfferedPlatformRoles = (
  myPrivileges: AuthorizationPrivilege[] | undefined
): (typeof RELEVANT_ROLES.Platform)[number][] => {
  if (!myPrivileges) {
    return [];
  }
  if (myPrivileges.includes(AuthorizationPrivilege.GrantGlobalAdmins)) {
    return [...RELEVANT_ROLES.Platform];
  }
  if (myPrivileges.includes(AuthorizationPrivilege.FeatureRoleAssign)) {
    return [...FEATURE_ROLES];
  }
  return [];
};

/**
 * SC-009 / FR-002: only the 3 `Feature …` roles may be held by an organization.
 * A `platform-*` role's organization section is never rendered — the server
 * rejects such a grant twice over (assignment rule 2, and
 * `organizationPolicy.maximum = 0`), so offering it would be predicting a rule.
 */
export const isFeaturePlatformRole = (role: RoleName): boolean => (FEATURE_ROLES as readonly RoleName[]).includes(role);

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
  loading: boolean;
  updating: boolean;
  refetchRoleSetAssignment: () => Promise<unknown>;
}

type useRoleSetManagerParams = {
  roleSetId: string | undefined;
  relevantRoles: readonly RoleName[];
  contributorTypes?: readonly ActorType[];
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
  contributorTypes = [ActorType.User, ActorType.Organization, ActorType.VirtualContributor],
  onChange,
  skip,
}: useRoleSetManagerParams): useRoleSetManagerProvided => {
  // The authorization (myPrivileges) query only needs the roleSetId — it must
  // NOT wait on `relevantRoles`, because a caller filtering the offered role
  // set by assigner capability (FR-012) needs `myPrivileges` *before* it knows
  // which roles it may even ask to see. The holder-list query below is the one
  // that depends on `relevantRoles` being resolved.
  const skipAuthorization = skip || !roleSetId;
  const skipAssignment = skip || !roleSetId || !relevantRoles || relevantRoles.length === 0;

  const { data: roleSetDetails, loading: loadingRoleSet } = useRoleSetAuthorizationQuery({
    variables: {
      roleSetId: roleSetId!,
    },
    skip: skipAuthorization,
  });
  const platformPrivileges = roleSetDetails?.platform.authorization?.myPrivileges;
  const myPrivileges = roleSetDetails?.lookup.roleSet?.authorization?.myPrivileges;

  const canReadRoleSet =
    (myPrivileges?.includes(AuthorizationPrivilege.Read) &&
      platformPrivileges?.includes(AuthorizationPrivilege.ReadUsers)) ??
    false;

  const validRoles = roleSetDetails?.lookup.roleSet?.roleNames;
  if (!skipAssignment && !loadingRoleSet && validRoles) {
    if (relevantRoles.some(role => !validRoles.includes(role))) {
      throw new Error(
        `RoleSet ${roleSetId} doesn't provide specified role ${relevantRoles.join(',')} != ${validRoles.join(',')}`
      );
    }
  }

  const {
    data: roleSetData,
    loading: loadingRoleSetData,
    refetch: refetchRoleSetAssignment,
  } = useRoleSetRoleAssignmentQuery({
    variables: {
      roleSetId: roleSetId!,
      roles: relevantRoles as RoleName[],
      includeUsers: fetchContributors && contributorTypes.includes(ActorType.User),
      includeOrganizations: fetchContributors && contributorTypes.includes(ActorType.Organization),
      includeVirtualContributors: fetchContributors && contributorTypes.includes(ActorType.VirtualContributor),
      includeRoleDefinitions: fetchRoleDefinitions,
    },
    skip: skipAssignment || !canReadRoleSet || loadingRoleSet,
  });

  const data = (() => {
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
      roleSetData?.lookup.roleSet?.roleDefinitions?.reduce(
        (acc, roleDefinition) => {
          acc[roleDefinition.name] = roleDefinition;
          return acc;
        },
        {} as Record<RoleName, RoleDefinition>
      );

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
  })();

  // Wraps any function call into an await + onChange call, to perform a refetch outside here if needed
  const onMutationCall =
    (mutation: (...args) => Promise<unknown>) =>
    async (...args) => {
      await mutation(...args);
      onChange?.();
    };

  const {
    assignRoleToUser,
    removeRoleFromUser,
    assignPlatformRoleToUser,
    removePlatformRoleFromUser,
    assignPlatformRoleToOrganization,
    removePlatformRoleFromOrganization,
    assignRoleToOrganization,
    removeRoleFromOrganization,
    assignRoleToVirtualContributor,
    removeRoleFromVirtualContributor,
    loading: updatingRoleSet,
  } = useRoleSetManagerRolesAssignment({ roleSetId, refetchRoleSetOnMutation: true });

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
    assignPlatformRoleToOrganization: onMutationCall(assignPlatformRoleToOrganization),
    assignRoleToOrganization: onMutationCall(assignRoleToOrganization),
    assignRoleToVirtualContributor: onMutationCall(assignRoleToVirtualContributor),
    removeRoleFromUser: onMutationCall(removeRoleFromUser),
    removePlatformRoleFromUser: onMutationCall(removePlatformRoleFromUser),
    removePlatformRoleFromOrganization: onMutationCall(removePlatformRoleFromOrganization),
    removeRoleFromOrganization: onMutationCall(removeRoleFromOrganization),
    removeRoleFromVirtualContributor: onMutationCall(removeRoleFromVirtualContributor),
    updating: updatingRoleSet,
    refetchRoleSetAssignment,
  };
};

export default useRoleSetManager;
