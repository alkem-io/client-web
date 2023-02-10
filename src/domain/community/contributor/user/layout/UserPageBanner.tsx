import React, { FC, useCallback, useMemo } from 'react';
import { useSendMessageToUserMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useApolloErrorHandler } from '../../../../../core/apollo/hooks/useApolloErrorHandler';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import ProfileBanner from '../../../../shared/components/PageHeader/ProfileBanner';
import { toSocialNetworkEnum } from '../../../../shared/components/SocialLinks/models/SocialNetworks';
import { isSocialLink } from '../../../../shared/components/SocialLinks/SocialLinks';
import { useUserContext } from '../hooks/useUserContext';
import { useUserMetadata } from '../hooks/useUserMetadata';

const UserPageBanner: FC = () => {
  const { userNameId = '' } = useUrlParams();
  const { user: currentUser } = useUserContext();
  const handleError = useApolloErrorHandler();

  const { user: userMetadata, loading } = useUserMetadata(userNameId);
  const userId = userMetadata?.user.id;
  const [sendMessageToUser] = useSendMessageToUserMutation({
    onError: handleError,
  });

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

  const references = userMetadata?.user?.profile?.references;
  const socialLinks = useMemo(() => {
    return references
      ?.map(s => ({
        type: toSocialNetworkEnum(s.name),
        url: s.uri,
      }))
      .filter(isSocialLink);
  }, [references]);

  if (!loading && userMetadata) {
    const { displayName, profile, phone, isContactable } = userMetadata.user;

    return (
      <ProfileBanner
        title={displayName}
        tagline={profile?.description}
        location={profile?.location}
        phone={phone}
        socialLinks={socialLinks}
        avatarUrl={profile?.avatar?.uri}
        loading={loading}
        onSendMessage={handleSendMessage}
        isContactable={isContactable && currentUser?.user.id !== userId}
      />
    );
  } else {
    return <ProfileBanner title={undefined} loading onSendMessage={handleSendMessage} />;
  }
};

export default UserPageBanner;
