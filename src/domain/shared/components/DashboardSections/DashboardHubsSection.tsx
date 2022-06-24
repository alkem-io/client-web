import React, { FC } from 'react';
import CardsLayout from '../../layout/CardsLayout/CardsLayout';
import Section, { DashboardGenericSectionProps } from './DashboardGenericSection';
import HubCard, { HubCardProps } from '../../../../components/composite/common/cards/HubCard/HubCard';
import { EntityContributionCardLabel } from '../../../../components/composite/common/cards/ContributionCard/EntityContributionCard';

export interface DashboardHubSectionProps extends DashboardGenericSectionProps {
  hubs: HubCardProps['hub'][];
  getHubCardLabel?: (hub: HubCardProps['hub']) => EntityContributionCardLabel | undefined;
}

const DashboardHubsSection: FC<DashboardHubSectionProps> = ({ hubs, getHubCardLabel, children, ...props }) => {
  return (
    <Section {...props}>
      {children}
      <CardsLayout items={hubs} deps={[getHubCardLabel]}>
        {hub => <HubCard hub={hub} getLabel={getHubCardLabel} />}
      </CardsLayout>
    </Section>
  );
};

export default DashboardHubsSection;
