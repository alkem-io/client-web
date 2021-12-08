import { Grid, Typography } from '@mui/material';
import React, { FC } from 'react';
import { Lifecycle as LifecycleModel } from '../../../../models/graphql-schema';
import Section, { SectionSpacer } from '../../../core/Section/Section';
import SectionHeader from '../../../core/Section/SectionHeader';
import LifecycleState from '../../entities/Lifecycle/LifecycleState';
import { Activities, ActivityItem } from '../ActivityPanel/Activities';

export interface DashboardOpportunityStatisticsProps {
  headerText: string;
  helpText?: string;
  bodyText?: string;
  lifecycle?: LifecycleModel;
  activities: ActivityItem[];
}

const DashboardOpportunityStatistics: FC<DashboardOpportunityStatisticsProps> = ({
  helpText,
  headerText,
  bodyText,
  activities,
  lifecycle,
}) => {
  return (
    <Section>
      <SectionHeader text={headerText} helpText={helpText} />
      {bodyText && <Typography variant="body1">{bodyText}</Typography>}
      <SectionSpacer />
      <Grid container columnSpacing={2}>
        <Grid item xs={6}>
          <Activities items={activities} />
        </Grid>
        <Grid item xs={6}>
          <LifecycleState lifecycle={lifecycle} />
        </Grid>
      </Grid>
    </Section>
  );
};
export default DashboardOpportunityStatistics;
