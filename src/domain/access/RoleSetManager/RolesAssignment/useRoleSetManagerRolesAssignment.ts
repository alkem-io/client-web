import type { DefaultContext } from '@apollo/client';
import {
  useAssignPlatformRoleToOrganizationMutation,
  useAssignPlatformRoleToUserMutation,
  useAssignRoleToOrganizationMutation,
  useAssignRoleToUserMutation,
  useAssignRoleToVirtualContributorMutation,
  useRemovePlatformRoleFromOrganizationMutation,
  useRemovePlatformRoleFromUserMutation,
  useRemoveRoleFromOrganizationMutation,
  useRemoveRoleFromUserMutation,
  useRemoveRoleFromVirtualContributorMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { RoleName } from '@/core/apollo/generated/graphql-schema';
import { OWN_ERROR_HANDLING } from '@/core/apollo/graphqlLinks/ownErrorHandling';
import { evictFromCache } from '@/core/apollo/utils/evictFromCache';

type useRoleSetManagerRolesAssignmentParams = {
  roleSetId: string | undefined;
  refetchRoleSetOnMutation?: boolean;
  /**
   * Apollo link context attached to every mutation this hook runs — e.g.
   * `OWN_ERROR_HANDLING` for a caller that shows its own message for every failure, so
   * the global error link does not add a second one. Omitted by default, so callers keep
   * the global handler.
   */
  context?: DefaultContext;
};

export type useRoleSetManagerRolesAssignmentProvided = {
  assignPlatformRoleToUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  removePlatformRoleFromUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  assignPlatformRoleToOrganization: (organizationId: string, roleName: RoleName) => Promise<unknown>;
  removePlatformRoleFromOrganization: (organizationId: string, roleName: RoleName) => Promise<unknown>;
  assignRoleToUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  removeRoleFromUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  assignRoleToOrganization: (organizationId: string, roleName: RoleName) => Promise<unknown>;
  removeRoleFromOrganization: (organizationId: string, roleName: RoleName) => Promise<unknown>;
  assignRoleToVirtualContributor: (vcId: string, roleName: RoleName) => Promise<unknown>;
  removeRoleFromVirtualContributor: (vcId: string, roleName: RoleName) => Promise<unknown>;
  loading: boolean;
};

/**
 * Do not use this hook directly, normally you should use useRoleSetManager instead
 */
const useRoleSetManagerRolesAssignment = ({
  roleSetId,
  refetchRoleSetOnMutation = false,
  context,
}: useRoleSetManagerRolesAssignmentParams): useRoleSetManagerRolesAssignmentProvided => {
  const refetchQueries = (cache: Parameters<typeof evictFromCache>[0]) => {
    if (refetchRoleSetOnMutation && roleSetId) {
      evictFromCache(cache, roleSetId, 'RoleSet');
    }
  };

  // Platform Roles: the assignment rules reject with distinct, rule-naming messages that the
  // admin page shows inline for every failure, so the global error link stays silent for them.
  const [runAssignPlatformRoleToUser, { loading: assignPlatformRoleToUserLoading }] =
    useAssignPlatformRoleToUserMutation({ context: OWN_ERROR_HANDLING });
  const [runRemovePlatformRoleFromUser, { loading: removePlatformRoleFromUserLoading }] =
    useRemovePlatformRoleFromUserMutation({ context: OWN_ERROR_HANDLING });
  const assignPlatformRoleToUser = (userId: string, role: RoleName) => {
    return runAssignPlatformRoleToUser({
      variables: {
        contributorId: userId,
        role,
      },
      update: cache => refetchQueries(cache),
      context,
    });
  };

  const removePlatformRoleFromUser = (userId: string, role: RoleName) => {
    return runRemovePlatformRoleFromUser({
      variables: {
        contributorId: userId,
        role,
      },
      update: cache => refetchQueries(cache),
      context,
    });
  };

  const [runAssignPlatformRoleToOrganization, { loading: assignPlatformRoleToOrganizationLoading }] =
    useAssignPlatformRoleToOrganizationMutation({ context: OWN_ERROR_HANDLING });
  const [runRemovePlatformRoleFromOrganization, { loading: removePlatformRoleFromOrganizationLoading }] =
    useRemovePlatformRoleFromOrganizationMutation({ context: OWN_ERROR_HANDLING });
  const assignPlatformRoleToOrganization = (organizationId: string, role: RoleName) => {
    return runAssignPlatformRoleToOrganization({
      variables: {
        contributorId: organizationId,
        role,
      },
      update: cache => refetchQueries(cache),
    });
  };

  const removePlatformRoleFromOrganization = (organizationId: string, role: RoleName) => {
    return runRemovePlatformRoleFromOrganization({
      variables: {
        contributorId: organizationId,
        role,
      },
      update: cache => refetchQueries(cache),
    });
  };

  // Normal RoleSets:
  const [runAssignRoleToUser, { loading: assignRoleToUserLoading }] = useAssignRoleToUserMutation();
  const [runRemoveRoleFromUser, { loading: removeRoleFromUserLoading }] = useRemoveRoleFromUserMutation();
  const assignRoleToUser = (userId: string, role: RoleName) => {
    return runAssignRoleToUser({
      variables: {
        contributorId: userId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
      context,
    });
  };

  const removeRoleFromUser = (userId: string, role: RoleName) => {
    return runRemoveRoleFromUser({
      variables: {
        contributorId: userId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
      context,
    });
  };

  const [runAssignRoleToOrganization, { loading: assignRoleToOrganizationLoading }] =
    useAssignRoleToOrganizationMutation();
  const [runRemoveRoleFromOrganization, { loading: removeRoleFromOrganizationLoading }] =
    useRemoveRoleFromOrganizationMutation();
  const assignRoleToOrganization = (organizationId: string, role: RoleName) => {
    return runAssignRoleToOrganization({
      variables: {
        contributorId: organizationId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
      context,
    });
  };

  const removeRoleFromOrganization = (organizationId: string, role: RoleName) => {
    return runRemoveRoleFromOrganization({
      variables: {
        contributorId: organizationId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
      context,
    });
  };

  const [runAssignRoleToVirtualContributor, { loading: assignRoleToVirtualContributorLoading }] =
    useAssignRoleToVirtualContributorMutation();
  const [runRemoveRoleFromVirtualContributor, { loading: removeRoleFromVirtualContributorLoading }] =
    useRemoveRoleFromVirtualContributorMutation();
  const assignRoleToVirtualContributor = (vcId: string, role: RoleName) => {
    return runAssignRoleToVirtualContributor({
      variables: {
        contributorId: vcId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
      context,
    });
  };

  const removeRoleFromVirtualContributor = (vcId: string, role: RoleName) => {
    return runRemoveRoleFromVirtualContributor({
      variables: {
        contributorId: vcId,
        role,
        // biome-ignore lint/style/noNonNullAssertion: guarded by caller
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
      context,
    });
  };
  const loading =
    assignPlatformRoleToUserLoading ||
    removePlatformRoleFromUserLoading ||
    assignPlatformRoleToOrganizationLoading ||
    removePlatformRoleFromOrganizationLoading ||
    assignRoleToUserLoading ||
    removeRoleFromUserLoading ||
    assignRoleToOrganizationLoading ||
    removeRoleFromOrganizationLoading ||
    assignRoleToVirtualContributorLoading ||
    removeRoleFromVirtualContributorLoading;

  const notReady = () => Promise.reject('roleSetId is not defined');
  return {
    assignPlatformRoleToUser: roleSetId ? assignPlatformRoleToUser : notReady,
    removePlatformRoleFromUser: roleSetId ? removePlatformRoleFromUser : notReady,
    assignPlatformRoleToOrganization: roleSetId ? assignPlatformRoleToOrganization : notReady,
    removePlatformRoleFromOrganization: roleSetId ? removePlatformRoleFromOrganization : notReady,
    assignRoleToUser: roleSetId ? assignRoleToUser : notReady,
    removeRoleFromUser: roleSetId ? removeRoleFromUser : notReady,
    assignRoleToOrganization: roleSetId ? assignRoleToOrganization : notReady,
    removeRoleFromOrganization: roleSetId ? removeRoleFromOrganization : notReady,
    assignRoleToVirtualContributor: roleSetId ? assignRoleToVirtualContributor : notReady,
    removeRoleFromVirtualContributor: roleSetId ? removeRoleFromVirtualContributor : notReady,
    loading,
  };
};

export default useRoleSetManagerRolesAssignment;
