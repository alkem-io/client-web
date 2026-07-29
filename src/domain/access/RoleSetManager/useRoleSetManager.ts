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

// sec-client-web-1: the ten legacy platform credentials remain the platform's
// live, authoritative privileged access until Slice B retires them — Slice A
// is strictly additive server-side. Dropping them from the offered set
// entirely (T004) left no in-console way to revoke a compromised or
// offboarded legacy holder during the Slice A -> Slice B window, forcing an
// incident response onto hand-crafted GraphQL or direct DB access. Kept here
// as a separate, clearly-labelled, remove-only group: offered only to a
// GRANT_GLOBAL_ADMINS holder (the same capability that could grant them
// originally), never rendered with an add affordance, and deleted in the same
// commit that retires the credentials in Slice B.
const LEGACY_PLATFORM_ROLES = [
  RoleName.GlobalAdmin,
  RoleName.GlobalSupport,
  RoleName.GlobalLicenseManager,
  RoleName.GlobalCommunityReader,
  RoleName.GlobalSpacesReader,
  RoleName.GlobalPlatformManager,
  RoleName.GlobalSupportManager,
  RoleName.PlatformBetaTester,
  RoleName.PlatformVcCampaign,
  RoleName.PlatformAssistantAccess,
] as const;

export const RELEVANT_ROLES = {
  Community: [RoleName.Admin, RoleName.Lead, RoleName.Member],
  Organization: [RoleName.Owner, RoleName.Admin, RoleName.Associate],
  Platform: [...PLATFORM_ADMIN_ROLES, ...FEATURE_ROLES],
  LegacyPlatform: LEGACY_PLATFORM_ROLES,
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
 * sec-client-web-1: the legacy platform credentials, offered strictly for
 * revocation (never grant) and only to a GRANT_GLOBAL_ADMINS holder — the
 * incident-response surface for the Slice A -> Slice B window. Deliberately
 * mirrors `getOfferedPlatformRoles`'s single client-side authorization
 * decision (read `myPrivileges`, reimplement no server rule); it does not
 * fall back to `FEATURE_ROLE_ASSIGN` because a Feature-role assigner never
 * held the legacy god-mode credentials in the first place.
 */
export const getOfferedLegacyPlatformRoles = (
  myPrivileges: AuthorizationPrivilege[] | undefined
): (typeof RELEVANT_ROLES.LegacyPlatform)[number][] => {
  if (!myPrivileges) {
    return [];
  }
  if (myPrivileges.includes(AuthorizationPrivilege.GrantGlobalAdmins)) {
    return [...RELEVANT_ROLES.LegacyPlatform];
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

// FR-032/A20/A20b: privileges that authorize reading a role set's holder list.
// `READ` is an additive legacy admitter (GLOBAL_ADMIN / GLOBAL_SUPPORT cascade),
// not the sole gate — see `canReadRoleSet` below.
const HOLDER_READ_PRIVILEGES: readonly AuthorizationPrivilege[] = [
  AuthorizationPrivilege.Read,
  AuthorizationPrivilege.PlatformRoleHoldersRead,
  AuthorizationPrivilege.FeatureRoleHoldersRead,
];

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
  /**
   * True once the holder-list read has been attempted (roles were requested,
   * `myPrivileges` has loaded) and the operator's privileges don't cover it, or
   * the read itself errored — as opposed to a genuinely empty holder list.
   * Callers use this to render an explicit "unavailable" state rather than a
   * silent "no members" (sec-client-web-2).
   */
  holdersUnavailable: boolean;
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

  // FR-032/A20/A20b: the server authorizes the holder-list read on
  // `PLATFORM_ROLE_HOLDERS_READ` / `FEATURE_ROLE_HOLDERS_READ` — none of the 13
  // target roles' assigners hold plain `READ` on the platform role-set. `READ`
  // is kept as an additive legacy admitter (GLOBAL_ADMIN / GLOBAL_SUPPORT
  // cascade rules still grant it), never the sole gate. This is a correction of
  // the existing client-side read precondition to the privilege FR-032 defines
  // — not a new, second rule; the assigner filter in getOfferedPlatformRoles
  // above still decides which roles are ever asked for.
  const canReadRoleSet =
    (myPrivileges?.some(privilege => HOLDER_READ_PRIVILEGES.includes(privilege)) &&
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
    error: roleSetDataError,
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

  // sec-client-web-2: a role subset was actually requested (relevantRoles
  // non-empty) but the read is unreachable — either myPrivileges doesn't cover
  // it or the query itself errored (e.g. a rejected/forbidden read). Distinct
  // from "the request ran and found zero holders".
  const holdersUnavailable = !skipAssignment && !loadingRoleSet && (!canReadRoleSet || Boolean(roleSetDataError));

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
    holdersUnavailable,
  };
};

export default useRoleSetManager;
