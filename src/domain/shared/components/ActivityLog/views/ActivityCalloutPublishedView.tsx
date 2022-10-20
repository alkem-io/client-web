import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';

export interface ActivityCalloutPublishedViewProps extends ActivityViewProps {}

export const ActivityCalloutPublishedView: FC<ActivityCalloutPublishedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.callout-published');

  return <ActivityBaseView action={action} {...props} />;
};
