import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity } from '../../../../models/graphql-schema';
import DashboardGenericSection from '../DashboardSections/DashboardGenericSection';
import { ActivityComponent } from './ActivityComponent';

export interface ActivityLogSectionProps {
  activities: Activity[] | undefined;
}

export const ActivitySection: FC<ActivityLogSectionProps> = ({ activities }) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection
      headerText={t('components.activity-log-section.title')}
      navText={t('common.explore')}
      navLink="explore"
    >
      <ActivityComponent activities={activities} />
    </DashboardGenericSection>
  );
};
