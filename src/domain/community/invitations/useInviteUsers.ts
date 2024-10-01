import {
  useInviteContributorsForRoleSetMembershipMutation,
  useInviteUserToPlatformAndRoleSetMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import ensurePresence from '../../../core/utils/ensurePresence';

export interface InviteUserData {
  message: string;
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
    inviteContributor: async ({ contributorIds, message }) => {
      await inviteExistingUser({
        variables: {
          contributorIds,
          message,
          roleSetId: ensurePresence(roleSetId),
        },
      });
      await onInviteContributor?.(ensurePresence(roleSetId));
    },
    platformInviteToCommunity: async ({ email, message }) => {
      await inviteUserForRoleSetAndPlatform({
        variables: {
          email,
          message,
          roleSetId: ensurePresence(roleSetId),
        },
      });
      await onInviteExternalUser?.(ensurePresence(roleSetId));
    },
  };
};

export default useInviteUsers;
