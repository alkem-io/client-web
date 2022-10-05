import { Typography } from '@mui/material';
import React, { FC } from 'react';
import Section, { SectionProps, SectionSpacer } from '../Section/Section';
import SectionHeader from '../Section/SectionHeader';
import { Metrics, MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';

interface DashboardActivitySectionProps {
  headerText: string;
  bodyText?: string;
  activities: MetricItem[];
  classes?: SectionProps['classes'];
}

const DashboardActivitySection: FC<DashboardActivitySectionProps> = ({ headerText, bodyText, activities, classes }) => {
  return (
    <Section classes={classes}>
      <SectionHeader text={headerText} />
      {bodyText && <Typography variant="body1">{bodyText}</Typography>}
      <SectionSpacer />
      <Metrics items={activities} asList={false} />
    </Section>
  );
};

export default DashboardActivitySection;
