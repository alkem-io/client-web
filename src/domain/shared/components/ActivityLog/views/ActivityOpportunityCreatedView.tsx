import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityOpportunityCreatedViewProps extends ActivityViewProps {}

export const ActivityOpportunityCreatedView: FC<ActivityOpportunityCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.opportunity-created');

  return <ActivityBaseView action={action} {...props} />;
};
