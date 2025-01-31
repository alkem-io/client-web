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

type useRoleSetAdminRolesAssignmentParams = {
  roleSetId: string | undefined;
};

export type useRoleSetAdminRolesAssignmentProvided = {
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
 * Do not use this hook directly, normally you should use useRoleSetAdmin instead
 */
const useRoleSetAdminRolesAssignment = ({
  roleSetId,
}: useRoleSetAdminRolesAssignmentParams): useRoleSetAdminRolesAssignmentProvided => {
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
      update: cache => evictFromCache(cache, roleSetId!, 'RoleSet'),
    });
  };

  const removePlatformRoleFromUser = (userId: string, role: RoleName) => {
    return runRemovePlatformRoleFromUser({
      variables: {
        contributorId: userId,
        role,
      },
      update: cache => evictFromCache(cache, roleSetId!, 'RoleSet'),
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
      update: cache => evictFromCache(cache, roleSetId!, 'RoleSet'),
    });
  };

  const removeRoleFromUser = (userId: string, role: RoleName) => {
    return runRemoveRoleFromUser({
      variables: {
        contributorId: userId,
        role,
        roleSetId: roleSetId!,
      },
      update: cache => evictFromCache(cache, roleSetId!, 'RoleSet'),
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
      update: cache => evictFromCache(cache, roleSetId!, 'RoleSet'),
    });
  };

  const removeRoleFromOrganization = (organizationId: string, role: RoleName) => {
    return runRemoveRoleFromOrganization({
      variables: {
        contributorId: organizationId,
        role,
        roleSetId: roleSetId!,
      },
      update: cache => evictFromCache(cache, roleSetId!, 'RoleSet'),
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
      update: cache => evictFromCache(cache, roleSetId!, 'RoleSet'),
    });
  };

  const removeRoleFromVirtualContributor = (vcId: string, role: RoleName) => {
    return runRemoveRoleFromVirtualContributor({
      variables: {
        contributorId: vcId,
        role,
        roleSetId: roleSetId!,
      },
      update: cache => evictFromCache(cache, roleSetId!, 'RoleSet'),
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
  if (!roleSetId) {
    return {
      assignPlatformRoleToUser: () => Promise.reject('roleSetId is not defined'),
      removePlatformRoleFromUser: () => Promise.reject('roleSetId is not defined'),
      assignRoleToUser: () => Promise.reject('roleSetId is not defined'),
      removeRoleFromUser: () => Promise.reject('roleSetId is not defined'),
      assignRoleToOrganization: () => Promise.reject('roleSetId is not defined'),
      removeRoleFromOrganization: () => Promise.reject('roleSetId is not defined'),
      assignRoleToVirtualContributor: () => Promise.reject('roleSetId is not defined'),
      removeRoleFromVirtualContributor: () => Promise.reject('roleSetId is not defined'),
      loading: false,
    };
  } else {
    return {
      assignPlatformRoleToUser,
      removePlatformRoleFromUser,
      assignRoleToUser,
      removeRoleFromUser,
      assignRoleToOrganization,
      removeRoleFromOrganization,
      assignRoleToVirtualContributor,
      removeRoleFromVirtualContributor,
      loading,
    };
  }
};

export default useRoleSetAdminRolesAssignment;
