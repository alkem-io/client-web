import {
  useInviteContributorsForRoleSetMembershipMutation,
  useInviteUserToPlatformAndRoleSetMutation,
} from '@core/apollo/generated/apollo-hooks';
import { CommunityRoleType } from '@core/apollo/generated/graphql-schema';
import ensurePresence from '@core/utils/ensurePresence';

export interface InviteUserData {
  message: string;
  extraRole?: CommunityRoleType;
}

export interface InviteContributorsData extends InviteUserData {
  contributorIds: string[];
}

export interface InviteExternalUserData extends InviteUserData {
  email: string;
}

interface UseInviteUsersProvided {
  inviteContributor: (params: InviteContributorsData) => Promise<void>;
  platformInviteToCommunity: (params: InviteExternalUserData) => Promise<void>;
}

interface UseInviteUsersCallbacks {
  onInviteContributor?: (roleSetId: string) => void | Promise<void>;
  onInviteExternalUser?: (roleSetId: string) => void | Promise<void>;
}

const useInviteUsers = (
  roleSetId: string | undefined,
  { onInviteContributor, onInviteExternalUser }: UseInviteUsersCallbacks = {}
): UseInviteUsersProvided => {
  const [inviteExistingUser] = useInviteContributorsForRoleSetMembershipMutation();
  const [inviteUserForRoleSetAndPlatform] = useInviteUserToPlatformAndRoleSetMutation();

  return {
    inviteContributor: async ({ contributorIds, message, extraRole }) => {
      const role = extraRole === CommunityRoleType.Member ? undefined : extraRole;

      await inviteExistingUser({
        variables: {
          contributorIds,
          message,
          extraRole: role,
          roleSetId: ensurePresence(roleSetId),
        },
      });
      await onInviteContributor?.(ensurePresence(roleSetId));
    },
    platformInviteToCommunity: async ({ email, message, extraRole }) => {
      const role = extraRole === CommunityRoleType.Member ? undefined : extraRole;

      await inviteUserForRoleSetAndPlatform({
        variables: {
          email,
          message,
          extraRole: role,
          roleSetId: ensurePresence(roleSetId),
        },
      });
      await onInviteExternalUser?.(ensurePresence(roleSetId));
    },
  };
};

export default useInviteUsers;
