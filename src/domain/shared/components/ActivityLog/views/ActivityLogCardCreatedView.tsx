import React, { FC } from 'react';
import { ActivityLogBaseView } from './ActivityLogBaseView';
import { ActivityLogViewProps } from './ActivityLogViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityLogCardCreatedViewProps extends ActivityLogViewProps {}

export const ActivityLogCardCreatedView: FC<ActivityLogCardCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.card-created', { parentDisplayName: props.parentDisplayName });

  return <ActivityLogBaseView action={action} {...props} />;
};
