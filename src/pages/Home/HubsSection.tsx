import Typography from '@mui/material/Typography/Typography';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardHubSection from '../../components/composite/common/sections/DashboardHubSection';
import { SectionSpacer } from '../../domain/shared/components/Section/Section';
import { useUserContext } from '../../hooks';
import { useHubsQuery } from '../../hooks/generated/graphql';

const HubSection = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const { data: hubsData, loading } = useHubsQuery({ fetchPolicy: 'cache-and-network' });
  const hubs = useMemo(() => hubsData?.hubs || [], [hubsData]);

  return (
    <DashboardHubSection
      headerText={t('pages.home.sections.hub.header')}
      subHeaderText={t('pages.home.sections.hub.subheader')}
      entities={{
        hubs: hubs,
        user,
      }}
      options={{
        itemBasis: '25%',
      }}
      loading={{ hubs: loading }}
    >
      <Typography variant="body1">{t('pages.home.sections.hub.body')}</Typography>
      <SectionSpacer />
    </DashboardHubSection>
  );
};

export default HubSection;
