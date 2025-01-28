import { useCallback, useMemo } from 'react';
import { useSendMessageToUserMutation } from '@/core/apollo/generated/apollo-hooks';
import { useUserContext } from '../hooks/useUserContext';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { useUserMetadata } from '../hooks/useUserMetadata';
import ProfilePageBanner from '@/domain/common/profile/ProfilePageBanner';
import useUrlResolver from '@/main/urlResolver/useUrlResolver';

const UserPageBanner = () => {
  const { user: currentUser } = useUserContext();
  const { userId } = useUrlResolver();
  const { user, loading } = useUserMetadata(userId);

  const isCurrentUser = useMemo(() => user?.user.id === currentUser?.user.id, [user, currentUser]);

  const profile = user?.user.profile;

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
      settingsUri={user && isCurrentUser ? buildSettingsUrl(user.user.profile.url) : undefined}
      loading={loading}
    />
  );
};

export default UserPageBanner;
