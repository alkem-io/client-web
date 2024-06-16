import {
  useInviteContributorsToCommunityMutation,
  useInviteExternalUserMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import ensurePresence from '../../../core/utils/ensurePresence';

interface InviteUserData {
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
  inviteExternalUser: (params: InviteExternalUserData) => Promise<void>;
}

interface UseInviteUsersCallbacks {
  onInviteContributor?: (communityId: string) => void | Promise<void>;
  onInviteExternalUser?: (communityId: string) => void | Promise<void>;
}

const useInviteUsers = (
  communityId: string | undefined,
  { onInviteContributor, onInviteExternalUser }: UseInviteUsersCallbacks = {}
): UseInviteUsersProvided => {
  const [inviteExistingUser] = useInviteContributorsToCommunityMutation();
  const [inviteExternalUser] = useInviteExternalUserMutation();

  return {
    inviteContributor: async ({ contributorIds, message }) => {
      await inviteExistingUser({
        variables: {
          contributorIds,
          message,
          communityId: ensurePresence(communityId),
        },
      });
      await onInviteContributor?.(ensurePresence(communityId));
    },
    inviteExternalUser: async ({ email, message }) => {
      await inviteExternalUser({
        variables: {
          email,
          message,
          communityId: ensurePresence(communityId),
        },
      });
      await onInviteExternalUser?.(ensurePresence(communityId));
    },
  };
};

export default useInviteUsers;
