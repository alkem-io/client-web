import React, { FC } from 'react';
import { UserMetadata } from '../../../../hooks';
import { EcoversesQuery } from '../../../../models/graphql-schema';
import { CardWrapperItem, CardWrapper } from '../../../core/CardWrapper/CardWrapper';
import Section, { DashboardGenericSectionProps } from './DashboardGenericSection';
import HubCard from '../cards/HubCard/HubCard';

interface DashboardHubSectionProps extends DashboardGenericSectionProps {
  entities: {
    hubs: EcoversesQuery['ecoverses'];
    user?: UserMetadata;
  };
  options: {
    itemBasis: '25%' | '33%' | '50%';
  };
  loading: {
    hubs?: boolean;
  };
}

const DashboardHubSection: FC<DashboardHubSectionProps> = ({ entities, loading, children, options, ...props }) => {
  const { hubs } = entities;
  return (
    <Section {...props}>
      {children}
      <CardWrapper>
        {hubs.map((ecoverse, i) => (
          <CardWrapperItem key={i}>
            <HubCard ecoverse={ecoverse} />
          </CardWrapperItem>
        ))}
      </CardWrapper>
    </Section>
  );
};

export default DashboardHubSection;
