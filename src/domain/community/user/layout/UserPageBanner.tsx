import { useSendMessageToUsersMutation } from '@/core/apollo/generated/apollo-hooks';
import ProfilePageBanner from '@/domain/common/profile/ProfilePageBanner';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { useCurrentUserContext } from '../../userCurrent/useCurrentUserContext';
import { useUserProvider } from '../hooks/useUserProvider';
import useUserRouteContext from '../routing/useUserRouteContext';

const UserPageBanner = () => {
  const { userModel: currentUser } = useCurrentUserContext();
  const { userId, loading: routeLoading, getProfileUrl } = useUserRouteContext();
  const { userModel: user, loading } = useUserProvider(userId);

  const isCurrentUser = user?.id === currentUser?.id;

  const profile = user?.profile;

  const [sendMessageToUser] = useSendMessageToUsersMutation();

  const handleSendMessage = async (messageText: string) => {
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
  };

  return (
    <ProfilePageBanner
      entityId={userId}
      profile={profile}
      onSendMessage={handleSendMessage}
      settingsUri={user && isCurrentUser ? buildSettingsUrl(getProfileUrl(user?.profile?.url) ?? '') : undefined}
      loading={loading || routeLoading}
    />
  );
};

export default UserPageBanner;
