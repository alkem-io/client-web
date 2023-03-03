import React, { FC } from 'react';
import OrganizationPageContainer from '../OrganizationPageContainer/OrganizationPageContainer';
import ProfileBanner from '../../../../shared/components/PageHeader/ProfileBanner';

const OrganizationPageBanner: FC = () => {
  return (
    <OrganizationPageContainer>
      {({ organization, permissions, socialLinks, handleSendMessage }, { loading }) => (
        <ProfileBanner
          title={organization?.profile.displayName}
          tagline={organization?.profile.description}
          location={organization?.profile.location}
          socialLinks={socialLinks}
          avatarUrl={organization?.profile.visual?.uri}
          avatarEditable={permissions.canEdit}
          loading={loading}
          onSendMessage={handleSendMessage}
        />
      )}
    </OrganizationPageContainer>
  );
};

export default OrganizationPageBanner;
