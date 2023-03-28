import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardContributorsSection from '../../../shared/components/DashboardSections/DashboardContributorsSection';
import { useHomePageContributors } from '../../../community/community/HomePageContributors';
import { Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ContributorsSection = () => {
  const { t } = useTranslation();

  const { entities, loading: isLoadingContributors } = useHomePageContributors();

  return (
    <DashboardContributorsSection
      headerText={t('pages.home.sections.contributors-section.title')}
      entities={entities}
      loading={isLoadingContributors}
    >
      <Button component={Link} to="/contributors" startIcon={<ArrowForward />} sx={{ alignSelf: 'end' }}>
        {t('common.contributors')}
      </Button>
    </DashboardContributorsSection>
  );
};

export default ContributorsSection;
