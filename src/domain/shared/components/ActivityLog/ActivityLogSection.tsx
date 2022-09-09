import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../DashboardSections/DashboardGenericSection';
import { ActivityLogComponent } from './ActivityLogComponent';
import { ActivityLog } from './ActivityLog';

export interface ActivityLogSectionProps {
  activityLog: ActivityLog[] | undefined;
}

export const ActivityLogSection: FC<ActivityLogSectionProps> = ({ activityLog }) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection headerText={t('components.activity-log-section.title')}>
      <ActivityLogComponent activityLog={activityLog} />
    </DashboardGenericSection>
  )
};
