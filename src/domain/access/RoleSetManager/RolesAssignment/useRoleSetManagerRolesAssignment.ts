import {
  useAssignPlatformRoleToUserMutation,
  useAssignRoleToOrganizationMutation,
  useAssignRoleToUserMutation,
  useAssignRoleToVirtualContributorMutation,
  useRemovePlatformRoleFromUserMutation,
  useRemoveRoleFromOrganizationMutation,
  useRemoveRoleFromUserMutation,
  useRemoveRoleFromVirtualContributorMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import { useMemo } from 'react';

type useRoleSetManagerRolesAssignmentParams = {
  roleSetId: string | undefined;
  refetchRoleSetOnMutation?: boolean;
};

export type useRoleSetManagerRolesAssignmentProvided = {
  assignPlatformRoleToUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  removePlatformRoleFromUser: (userId: string, roleName: RoleName) => Promise<unknown>;
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
}: useRoleSetManagerRolesAssignmentParams): useRoleSetManagerRolesAssignmentProvided => {
  const refetchQueries = (cache: Parameters<typeof evictFromCache>[0]) => {
    if (refetchRoleSetOnMutation && roleSetId) {
      evictFromCache(cache, roleSetId, 'RoleSet');
    }
  };

  // Platform Roles:
  const [runAssignPlatformRoleToUser, { loading: assignPlatformRoleToUserLoading }] =
    useAssignPlatformRoleToUserMutation();
  const [runRemovePlatformRoleFromUser, { loading: removePlatformRoleFromUserLoading }] =
    useRemovePlatformRoleFromUserMutation();
  const assignPlatformRoleToUser = (userId: string, role: RoleName) => {
    return runAssignPlatformRoleToUser({
      variables: {
        contributorId: userId,
        role,
      },
      update: cache => refetchQueries(cache),
    });
  };

  const removePlatformRoleFromUser = (userId: string, role: RoleName) => {
    return runRemovePlatformRoleFromUser({
      variables: {
        contributorId: userId,
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
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
    });
  };

  const removeRoleFromUser = (userId: string, role: RoleName) => {
    return runRemoveRoleFromUser({
      variables: {
        contributorId: userId,
        role,
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
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
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
    });
  };

  const removeRoleFromOrganization = (organizationId: string, role: RoleName) => {
    return runRemoveRoleFromOrganization({
      variables: {
        contributorId: organizationId,
        role,
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
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
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
    });
  };

  const removeRoleFromVirtualContributor = (vcId: string, role: RoleName) => {
    return runRemoveRoleFromVirtualContributor({
      variables: {
        contributorId: vcId,
        role,
        roleSetId: roleSetId!,
      },
      update: cache => refetchQueries(cache),
    });
  };
  const loading =
    assignPlatformRoleToUserLoading ||
    removePlatformRoleFromUserLoading ||
    assignRoleToUserLoading ||
    removeRoleFromUserLoading ||
    assignRoleToOrganizationLoading ||
    removeRoleFromOrganizationLoading ||
    assignRoleToVirtualContributorLoading ||
    removeRoleFromVirtualContributorLoading;

  const notReady = () => Promise.reject('roleSetId is not defined');
  return useMemo(
    () => ({
      assignPlatformRoleToUser: roleSetId ? assignPlatformRoleToUser : notReady,
      removePlatformRoleFromUser: roleSetId ? removePlatformRoleFromUser : notReady,
      assignRoleToUser: roleSetId ? assignRoleToUser : notReady,
      removeRoleFromUser: roleSetId ? removeRoleFromUser : notReady,
      assignRoleToOrganization: roleSetId ? assignRoleToOrganization : notReady,
      removeRoleFromOrganization: roleSetId ? removeRoleFromOrganization : notReady,
      assignRoleToVirtualContributor: roleSetId ? assignRoleToVirtualContributor : notReady,
      removeRoleFromVirtualContributor: roleSetId ? removeRoleFromVirtualContributor : notReady,
      loading,
    }),
    [roleSetId, loading]
  );
};

export default useRoleSetManagerRolesAssignment;
