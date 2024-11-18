import React, { useCallback, useMemo } from 'react';
import { useSendMessageToUserMutation } from '@/core/apollo/generated/apollo-hooks';
import { useUserContext } from '../hooks/useUserContext';
import { buildUserProfileSettingsUrl } from '@/main/routing/urlBuilders';
import { useUserMetadata } from '../hooks/useUserMetadata';
import { useUrlParams } from '@/core/routing/useUrlParams';
import ProfilePageBanner from '../../../common/profile/ProfilePageBanner';

const UserPageBanner = () => {
  const { userNameId } = useUrlParams();

  if (!userNameId) {
    throw new Error('User nameID not present');
  }

  const { user: currentUser } = useUserContext();

  const { user, loading } = useUserMetadata(userNameId);

  const isCurrentUser = useMemo(() => user?.user.id === currentUser?.user.id, [user, currentUser]);

  const profile = user?.user.profile;

  const userId = user?.user.id;

  const [sendMessageToUser] = useSendMessageToUserMutation();

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!userId) {
        throw new Error('User not loaded.');
      }

      await sendMessageToUser({
        variables: {
          messageData: {
            message: messageText,
            receiverIds: [userId],
          },
        },
      });
    },
    [sendMessageToUser, userId]
  );

  return (
    <ProfilePageBanner
      entityId={userId}
      profile={profile}
      onSendMessage={handleSendMessage}
      settingsUri={user && isCurrentUser ? buildUserProfileSettingsUrl(user.user.nameID) : undefined}
      loading={loading}
    />
  );
};

export default UserPageBanner;
