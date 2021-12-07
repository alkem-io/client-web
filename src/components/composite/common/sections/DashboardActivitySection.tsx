import { Typography } from '@mui/material';
import React, { FC } from 'react';
import Section, { SectionSpacer } from '../../../core/Section/Section';
import SectionHeader from '../../../core/Section/SectionHeader';
import { Activities, ActivityItem } from '../../common/ActivityPanel/Activities';

interface DashboardActivitySectionProps {
  headerText: string;
  bodyText?: string;
  activities: ActivityItem[];
}

const DashboardActivitySection: FC<DashboardActivitySectionProps> = ({ headerText, bodyText, activities }) => {
  return (
    <Section>
      <SectionHeader text={headerText} />
      {bodyText && <Typography variant="body1">{bodyText}</Typography>}
      <SectionSpacer />
      <Activities items={activities} asList={false} />
    </Section>
  );
};

export default DashboardActivitySection;
