import { Typography } from '@mui/material';
import React, { FC } from 'react';
import Section, { SectionProps, SectionSpacer } from '../../../core/Section/Section';
import SectionHeader from '../../../core/Section/SectionHeader';
import { Activities, ActivityItem } from '../../common/ActivityPanel/Activities';

interface DashboardActivitySectionProps {
  headerText: string;
  bodyText?: string;
  activities: ActivityItem[];
  classes?: SectionProps['classes'];
}

const DashboardActivitySection: FC<DashboardActivitySectionProps> = ({ headerText, bodyText, activities, classes }) => {
  return (
    <Section classes={classes}>
      <SectionHeader text={headerText} />
      {bodyText && <Typography variant="body1">{bodyText}</Typography>}
      <SectionSpacer />
      <Activities items={activities} asList={false} />
    </Section>
  );
};

export default DashboardActivitySection;
