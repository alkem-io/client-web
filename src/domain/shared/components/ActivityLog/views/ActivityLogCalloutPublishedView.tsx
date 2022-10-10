import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityLogBaseView } from './ActivityLogBaseView';
import { ActivityLogViewProps } from './ActivityLogViewProps';

export interface ActivityLogCalloutPublishedViewProps extends ActivityLogViewProps {}

export const ActivityLogCalloutPublishedView: FC<ActivityLogCalloutPublishedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.callout-published');

  return <ActivityLogBaseView action={action} {...props} />;
};
