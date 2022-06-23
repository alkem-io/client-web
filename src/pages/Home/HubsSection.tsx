import Typography from '@mui/material/Typography/Typography';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardHubsSection, {
  DashboardHubSectionProps,
} from '../../domain/shared/components/DashboardSections/DashboardHubsSection';
import { useHubsQuery } from '../../hooks/generated/graphql';
import { useUserContext } from '../../hooks';
import { EntityContributionCardLabel } from '../../components/composite/common/cards/ContributionCard/EntityContributionCard';

const HubsSection = () => {
  const { t } = useTranslation();
  const { data: hubsData } = useHubsQuery({ fetchPolicy: 'cache-and-network' });
  const hubs = useMemo(() => hubsData?.hubs || [], [hubsData]);

  const { user } = useUserContext();

  const isMember = (hubId: string) => user?.ofHub(hubId) ?? false;

  const getHubCardLabel: DashboardHubSectionProps['getHubCardLabel'] = hub => {
    if (isMember(hub.id)) {
      return EntityContributionCardLabel.Member;
    }
    if (!hub.authorization?.anonymousReadAccess) {
      return EntityContributionCardLabel.Anonymous;
    }
  };

  return (
    <DashboardHubsSection
      headerText={t('pages.home.sections.hub.header')}
      subHeaderText={t('pages.home.sections.hub.subheader')}
      hubs={hubs}
      getHubCardLabel={getHubCardLabel}
    >
      <Typography variant="body1">{t('pages.home.sections.hub.body')}</Typography>
    </DashboardHubsSection>
  );
};

export default HubsSection;
