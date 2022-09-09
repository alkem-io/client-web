import React, { FC } from 'react';
import { ActivityLogBaseView } from './ActivityLogBaseView';
import { ActivityLogViewProps } from './ActivityLogViewProps';
import { useTranslation } from 'react-i18next';


export interface ActivityLogCanvasCreatedViewProps extends ActivityLogViewProps {}

export const ActivityLogCanvasCreatedView: FC<ActivityLogCanvasCreatedViewProps> = ({ author, createdDate, description }) => {
  const { t } = useTranslation();

  const action = t('components.activity-log-view.actions.canvas-created');

  return (
    <ActivityLogBaseView
      author={author}
      createdDate={createdDate}
      action={action}
      description={description}
    />
  )
};
