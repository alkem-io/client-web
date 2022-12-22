import { Grid } from '@mui/material';
import React, { FC } from 'react';
import ContributorCard, {
  ContributorCardProps,
  ContributorCardSkeleton,
} from '../../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import { WithId } from '../../../../types/WithId';
import { times } from 'lodash';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import PageContentBlockGrid from '../../../../core/ui/content/PageContentBlockGrid';

const MAX_ITEMS_TO_SHOW = 20;

export interface DashboardContributorsSectionSectionProps {
  headerText: string;
  entities: {
    contributors: WithId<ContributorCardProps>[];
  };
  loading: boolean;
}

const DashboardContributorsSection: FC<DashboardContributorsSectionSectionProps> = ({
  headerText,
  entities,
  loading,
  children,
}) => {
  const { contributors } = entities;

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={headerText} />
      <PageContentBlockGrid disablePadding cards>
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
      </PageContentBlockGrid>
      {children}
    </PageContentBlock>
  );
};

export default DashboardContributorsSection;
