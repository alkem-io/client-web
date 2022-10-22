import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { JourneyLocation } from '../../../../common/utils/urlBuilders';
import DashboardGenericSection from '../DashboardSections/DashboardGenericSection';
import { ActivityComponent, ActivityLogResultType } from './ActivityComponent';

export interface ActivityLogSectionProps {
  activities: ActivityLogResultType[] | undefined;
  journeyLocation: JourneyLocation;
}

export const ActivitySection: FC<ActivityLogSectionProps> = ({ ...rest }) => {
  const { t } = useTranslation();

  return (
    <DashboardGenericSection
      headerText={t('components.activity-log-section.title')}
      navText={t('common.explore')}
      navLink="explore"
    >
      <ActivityComponent {...rest} />
    </DashboardGenericSection>
  );
};
