import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../../../hooks';
import ProfileBanner from '../../../shared/components/PageHeader/ProfileBanner';
import { toSocialNetworkEnum } from '../../../shared/components/SocialLinks/models/SocialNetworks';
import { isSocialLink } from '../../../shared/components/SocialLinks/SocialLinks';
import { useUserMetadata } from '../hooks/useUserMetadata';

const UserPageBanner: FC = () => {
  const { userNameId = '' } = useUrlParams();

  const { user: userMetadata, loading } = useUserMetadata(userNameId);

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
    const { displayName, profile, phone } = userMetadata.user;

    return (
      <ProfileBanner
        title={displayName}
        tagline={profile?.description}
        location={profile?.location}
        phone={phone}
        socialLinks={socialLinks}
        avatarUrl={profile?.avatar?.uri}
        loading={loading}
      />
    );
  } else {
    return <ProfileBanner title={undefined} loading />;
  }
};

export default UserPageBanner;
