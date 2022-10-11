import { Grid } from '@mui/material';
import React, { FC } from 'react';
import ContributorCard, {
  ContributorCardProps,
  ContributorCardSkeleton,
} from '../../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import Section, { DashboardGenericSectionProps } from './DashboardGenericSection';
import { WithId } from '../../../../types/WithId';
import { times } from 'lodash';

const MAX_ITEMS_TO_SHOW = 20;

export interface DashboardContributorsSectionSectionProps extends DashboardGenericSectionProps {
  entities: {
    contributors: WithId<ContributorCardProps>[];
  };
  loading: boolean;
}

const DashboardContributorsSection: FC<DashboardContributorsSectionSectionProps> = ({
  entities,
  loading,
  children,
  ...props
}) => {
  const { contributors } = entities;

  return (
    <Section {...props}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={1} alignItems="center">
            {loading &&
              times(MAX_ITEMS_TO_SHOW, i => (
                <Grid item flexBasis={'10%'} key={`__loading_${i}`}>
                  <ContributorCardSkeleton />
                </Grid>
              ))}
            {contributors.map(c => {
              return (
                <Grid item flexBasis={'10%'} key={c.id}>
                  <ContributorCard {...c} />
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Section>
  );
};

export default DashboardContributorsSection;
