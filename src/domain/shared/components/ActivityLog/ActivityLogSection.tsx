import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity } from '../../../../models/graphql-schema';
import DashboardGenericSection from '../DashboardSections/DashboardGenericSection';
import { ActivityLogComponent } from './ActivityLogComponent';

export interface ActivityLogSectionProps {
  activities: Activity[] | undefined;
}

export const ActivityLogSection: FC<ActivityLogSectionProps> = ({ activities }) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection headerText={t('components.activity-log-section.title')}>
      <ActivityLogComponent activities={activities} />
    </DashboardGenericSection>
  );
};
