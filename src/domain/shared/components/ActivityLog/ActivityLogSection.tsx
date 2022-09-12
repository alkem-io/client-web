import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity } from '../../../../models/graphql-schema';
import DashboardGenericSection from '../DashboardSections/DashboardGenericSection';
import { ActivityLogComponent } from './ActivityLogComponent';

export interface ActivityLogSectionProps {
  activity: Activity[] | undefined;
}

export const ActivityLogSection: FC<ActivityLogSectionProps> = ({ activity }) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection headerText={t('components.activity-log-section.title')}>
      <ActivityLogComponent activity={activity} />
    </DashboardGenericSection>
  );
};
