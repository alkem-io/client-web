import {
  useInviteExistingUserMutation,
  useInviteExternalUserMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import ensurePresence from '../../../core/utils/ensurePresence';

interface InviteUserData {
  message: string;
}

export interface InviteExistingUserData extends InviteUserData {
  userIds: string[];
}

export interface InviteExternalUserData extends InviteUserData {
  email: string;
}

interface UseInviteUsersProvided {
  inviteExistingUser: (params: InviteExistingUserData) => Promise<void>;
  inviteExternalUser: (params: InviteExternalUserData) => Promise<void>;
}

interface UseInviteUsersCallbacks {
  onInviteExistingUser?: (communityId: string) => void | Promise<void>;
  onInviteExternalUser?: (communityId: string) => void | Promise<void>;
}

const useInviteUsers = (
  communityId: string | undefined,
  { onInviteExistingUser, onInviteExternalUser }: UseInviteUsersCallbacks = {}
): UseInviteUsersProvided => {
  const [inviteExistingUser] = useInviteExistingUserMutation();
  const [inviteExternalUser] = useInviteExternalUserMutation();

  return {
    inviteExistingUser: async ({ userIds, message }) => {
      await inviteExistingUser({
        variables: {
          userIds,
          message,
          communityId: ensurePresence(communityId),
        },
      });
      await onInviteExistingUser?.(ensurePresence(communityId));
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
