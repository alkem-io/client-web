import {
  useAssignPlatformRoleToUserMutation,
  useRemovePlatformRoleFromUserMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

type useRoleSetAdminMutationsParams = {
  roleSetId: string | undefined;
};

export type useRoleSetAdminMutationsProvided = {
  assignPlatformRoleToUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  removePlatformRoleFromUser: (userId: string, roleName: RoleName) => Promise<unknown>;
  loading: boolean;
};

const useRoleSetAdminMutations = ({ roleSetId }: useRoleSetAdminMutationsParams): useRoleSetAdminMutationsProvided => {
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
        roleSetId: roleSetId!,
      },
    });
  };

  const removePlatformRoleFromUser = (userId: string, role: RoleName) => {
    return runRemovePlatformRoleFromUser({
      variables: {
        contributorId: userId,
        role,
        roleSetId: roleSetId!,
      },
    });
  };

  const loading = assignPlatformRoleToUserLoading || removePlatformRoleFromUserLoading;
  if (!roleSetId) {
    return {
      assignPlatformRoleToUser: () => Promise.reject('roleSetId is not defined'),
      removePlatformRoleFromUser: () => Promise.reject('roleSetId is not defined'),
      loading: false,
    };
  } else {
    return {
      assignPlatformRoleToUser,
      removePlatformRoleFromUser,
      loading,
    };
  }
};

export default useRoleSetAdminMutations;
