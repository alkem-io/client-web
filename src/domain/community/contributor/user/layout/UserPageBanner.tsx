import React, { FC, useCallback, useMemo } from 'react';
import { useSendMessageToUserMutation } from '../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import ProfileBanner from '../../../../shared/components/PageHeader/ProfileBanner';
import { toSocialNetworkEnum } from '../../../../shared/components/SocialLinks/models/SocialNetworks';
import { isSocialLink } from '../../../../shared/components/SocialLinks/SocialLinks';
import { useUserMetadata } from '../hooks/useUserMetadata';

const UserPageBanner: FC = () => {
  const { userNameId = '' } = useUrlParams();

  const { user: userMetadata, loading } = useUserMetadata(userNameId);
  const userId = userMetadata?.user.id;
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
        contactable={isContactable}
      />
    );
  } else {
    return <ProfileBanner title={undefined} loading onSendMessage={handleSendMessage} />;
  }
};

export default UserPageBanner;
