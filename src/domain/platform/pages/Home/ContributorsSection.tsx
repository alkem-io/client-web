import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContributorsSection from '../../../shared/components/DashboardSections/DashboardContributorsSection';
import { useHomePageContributors } from '../../../community/community/HomePageContributors';

const ContributorsSection = () => {
  const { t } = useTranslation();

  const { entities, loading: isLoadingContributors } = useHomePageContributors();

  return (
    <DashboardContributorsSection
      headerText={t('pages.home.sections.contributors-section.title')}
      navText={`${t('common.contributors')}`}
      navLink="contributors"
      entities={entities}
      loading={isLoadingContributors}
    />
  );
};

export default ContributorsSection;
