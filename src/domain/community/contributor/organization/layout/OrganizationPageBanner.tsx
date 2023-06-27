import React, { FC } from 'react';
import OrganizationPageContainer from '../OrganizationPageContainer/OrganizationPageContainer';
import ProfileBanner from '../../../../shared/components/PageHeader/ProfileBanner';
import { useTranslation } from 'react-i18next';

const OrganizationPageBanner: FC = () => {
  const { t } = useTranslation();

  return (
    <OrganizationPageContainer>
      {({ organization, permissions, socialLinks, handleSendMessage }, { loading }) => (
        <ProfileBanner
          title={organization?.profile.displayName}
          tagline={organization?.profile.tagline}
          location={organization?.profile.location}
          socialLinks={socialLinks}
          avatarUrl={organization?.profile.visual?.uri}
          avatarAltText={t('visuals-alt-text.avatar.contributor.text', {
            displayName: organization?.profile.displayName,
            altText: organization?.profile.visual?.alternativeText,
          })}
          avatarEditable={permissions.canEdit}
          loading={loading}
          onSendMessage={handleSendMessage}
        />
      )}
    </OrganizationPageContainer>
  );
};

export default OrganizationPageBanner;
