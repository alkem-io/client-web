import React, { FC } from 'react';
import { ActivityLogBaseView } from './ActivityLogBaseView';
import { ActivityLogViewProps } from './ActivityLogViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityLogCanvasCreatedViewProps extends ActivityLogViewProps {}

export const ActivityLogCanvasCreatedView: FC<ActivityLogCanvasCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.canvas-created', {
    parentDisplayName: props.parentDisplayName,
  });

  return <ActivityLogBaseView action={action} {...props} />;
};
