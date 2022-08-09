import { Grid, Typography } from '@mui/material';
import React, { FC } from 'react';
import { Lifecycle as LifecycleModel } from '../../../../models/graphql-schema';
import ActivityView from '../../../../views/Activity/ActivityView';
import Section, { SectionSpacer } from '../Section/Section';
import SectionHeader from '../Section/SectionHeader';
import { ActivityItem } from '../../../../components/composite/common/ActivityPanel/Activities';

export interface DashboardOpportunityStatisticsProps {
  headerText: string;
  helpText?: string;
  bodyText?: string;
  lifecycle?: LifecycleModel; // TODO remove if there are no plans to re-add
  activities: ActivityItem[];
  loading: boolean;
}

const DashboardOpportunityStatistics: FC<DashboardOpportunityStatisticsProps> = ({
  helpText,
  headerText,
  bodyText,
  activities,
  loading,
}) => {
  return (
    <Section>
      <SectionHeader text={headerText} helpText={helpText} />
      {bodyText && <Typography variant="body1">{bodyText}</Typography>}
      <SectionSpacer />
      <Grid container columnSpacing={2}>
        <Grid item xs={6}>
          <ActivityView activity={activities} loading={loading} />
        </Grid>
        <Grid item xs={6}>
          {/* <LifecycleState lifecycle={lifecycle} /> */}
        </Grid>
      </Grid>
    </Section>
  );
};
export default DashboardOpportunityStatistics;
