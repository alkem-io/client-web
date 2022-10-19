import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityCanvasCreatedViewProps extends ActivityViewProps {}

export const ActivityCanvasCreatedView: FC<ActivityCanvasCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.canvas-created');

  return <ActivityBaseView action={action} {...props} />;
};
