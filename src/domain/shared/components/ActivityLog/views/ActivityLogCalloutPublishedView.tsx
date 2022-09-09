import React, { FC } from 'react';
import { ActivityLogBaseView } from './ActivityLogBaseView';
import { ActivityLogViewProps } from './ActivityLogViewProps';
import { useTranslation } from 'react-i18next';


export interface ActivityLogCalloutPublishedViewProps extends ActivityLogViewProps {}

export const ActivityLogCalloutPublishedView: FC<ActivityLogCalloutPublishedViewProps> = ({ createdDate, description, author }) => {
  const { t } = useTranslation();

  const action = t('components.activity-log-view.actions.callout-published');

  return (
    <ActivityLogBaseView
      author={author}
      createdDate={createdDate}
      action={action}
      description={description}
    />
  )
};
