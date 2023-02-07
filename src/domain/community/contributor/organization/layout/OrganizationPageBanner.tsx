import React, { FC } from 'react';
import OrganizationPageContainer from '../OrganizationPageContainer/OrganizationPageContainer';
import ProfileBanner from '../../../../shared/components/PageHeader/ProfileBanner';

const OrganizationPageBanner: FC = () => {
  return (
    <OrganizationPageContainer>
      {({ organization, permissions, socialLinks }, { loading }) => (
        <ProfileBanner
          id={organization?.id ?? ''}
          title={organization?.displayName}
          tagline={organization?.profile?.description}
          location={organization?.profile?.location}
          socialLinks={socialLinks}
          avatarUrl={organization?.profile?.avatar?.uri}
          avatarEditable={permissions.canEdit}
          loading={loading}
        />
      )}
    </OrganizationPageContainer>
  );
};

export default OrganizationPageBanner;
