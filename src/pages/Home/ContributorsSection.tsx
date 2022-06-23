import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContributorsSection from '../../domain/shared/components/DashboardSections/DashboardContributorsSection';
import { useHomePageContributors } from '../../domain/community/HomePageContributors';

const ContributorsSection = () => {
  const { t } = useTranslation();

  const { entities, loading } = useHomePageContributors();

  return (
    <DashboardContributorsSection
      headerText={t('contributors-section.title')}
      subHeaderText={t('contributors-section.subheader')}
      userTitle={t('contributors-section.users-title')}
      organizationTitle={t('contributors-section.organizations-title')}
      navText={`${t('buttons.see-more')}...`}
      navLink="contributors"
      entities={entities}
      loading={loading}
    />
  );
};

export default ContributorsSection;
