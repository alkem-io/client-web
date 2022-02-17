import React, { FC } from 'react';
import { UserMetadata } from '../../../../hooks';
import { HubsQuery } from '../../../../models/graphql-schema';
import { CardLayoutItem, CardLayoutContainer } from '../../../core/CardLayoutContainer/CardLayoutContainer';
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
      <CardLayoutContainer>
        {hubs.map((hub, i) => (
          <CardLayoutItem key={i}>
            <HubCard hub={hub} />
          </CardLayoutItem>
        ))}
      </CardLayoutContainer>
    </Section>
  );
};

export default DashboardHubSection;
