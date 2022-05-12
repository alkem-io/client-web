import React, { FC } from 'react';
import { UserMetadata } from '../../../../hooks';
import { HubsQuery } from '../../../../models/graphql-schema';
import CardsLayout from '../../../../domain/shared/layout/CardsLayout/CardsLayout';
import Section, { DashboardGenericSectionProps } from './DashboardGenericSection';
import HubCard from '../cards/HubCard/HubCard';

interface DashboardHubSectionProps extends DashboardGenericSectionProps {
  entities: {
    hubs: HubsQuery['hubs'];
    user?: UserMetadata;
  };
  options: {
    itemBasis: '25%' | '33%' | '50%';
  } & DashboardGenericSectionProps['options'];
  loading: {
    hubs?: boolean;
  };
}

const DashboardHubSection: FC<DashboardHubSectionProps> = ({ entities, loading, children, options, ...props }) => {
  const { hubs } = entities;
  return (
    <Section {...props}>
      {children}
      <CardsLayout items={hubs}>{hub => <HubCard hub={hub} />}</CardsLayout>
    </Section>
  );
};

export default DashboardHubSection;
