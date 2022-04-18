import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContributorsSection from '../../components/composite/common/sections/DashboardContributorsSection';
import useContributors from '../../hooks/useContributors';

const ContributorsSection = () => {
  const { t } = useTranslation();

  const { entities, loading } = useContributors();

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
