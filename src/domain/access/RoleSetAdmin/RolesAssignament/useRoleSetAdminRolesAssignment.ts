import {
  useAssignPlatformRoleToUserMutation,
  useAssignRoleToUserMutation,
  useRemovePlatformRoleFromUserMutation,
  useRemoveRoleFromUserMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

type useRoleSetAdminRolesAssignmentParams = {
  roleSetId: string | undefined;
};

export type useRoleSetAdminRolesAssignmentProvided = {
  assignPlatformRoleToUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  removePlatformRoleFromUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  assignRoleToUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  removeRoleFromUser: (userId: string, roleName: RoleName) => Promise<unknown>;
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
    });
  };

  const removePlatformRoleFromUser = (userId: string, role: RoleName) => {
    return runRemovePlatformRoleFromUser({
      variables: {
        contributorId: userId,
        role,
      },
    });
  };

  // Platform Roles:
  const [runAssignRoleToUser, { loading: assignRoleToUserLoading }] = useAssignRoleToUserMutation();
  const [runRemoveRoleFromUser, { loading: removeRoleFromUserLoading }] = useRemoveRoleFromUserMutation();
  const assignRoleToUser = (userId: string, role: RoleName) => {
    return runAssignRoleToUser({
      variables: {
        contributorId: userId,
        role,
        roleSetId: roleSetId!,
      },
    });
  };

  const removeRoleFromUser = (userId: string, role: RoleName) => {
    return runRemoveRoleFromUser({
      variables: {
        contributorId: userId,
        role,
        roleSetId: roleSetId!,
      },
    });
  };

  const loading =
    assignPlatformRoleToUserLoading ||
    removePlatformRoleFromUserLoading ||
    assignRoleToUserLoading ||
    removeRoleFromUserLoading;
  if (!roleSetId) {
    return {
      assignPlatformRoleToUser: () => Promise.reject('roleSetId is not defined'),
      removePlatformRoleFromUser: () => Promise.reject('roleSetId is not defined'),
      assignRoleToUser: () => Promise.reject('roleSetId is not defined'),
      removeRoleFromUser: () => Promise.reject('roleSetId is not defined'),
      loading: false,
    };
  } else {
    return {
      assignPlatformRoleToUser,
      removePlatformRoleFromUser,
      assignRoleToUser,
      removeRoleFromUser,
      loading,
    };
  }
};

export default useRoleSetAdminRolesAssignment;
