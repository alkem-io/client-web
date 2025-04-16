import { useCallback, useMemo } from 'react';
import { useSendMessageToUserMutation } from '@/core/apollo/generated/apollo-hooks';
import { useCurrentUserContext } from '../hooks/useCurrentUserContext';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { useUserMetadata } from '../../../../_deprecated/useUserMetadata';
import ProfilePageBanner from '@/domain/common/profile/ProfilePageBanner';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

const UserPageBanner = () => {
  const { user: currentUser } = useCurrentUserContext();
  const { userId, loading: urlResolverLoading } = useUrlResolver();
  const { user, loading } = useUserMetadata(userId);

  const isCurrentUser = useMemo(() => user?.id === currentUser?.user.id, [user, currentUser]);

  const profile = user?.profile;

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

  const userURL = user?.profile.url || '';

  return (
    <ProfilePageBanner
      entityId={userId}
      profile={profile}
      onSendMessage={handleSendMessage}
      settingsUri={user && isCurrentUser ? buildSettingsUrl(userURL) : undefined}
      loading={loading || urlResolverLoading}
    />
  );
};

export default UserPageBanner;
