import React, { FC } from 'react';
import { ActivityLogBaseView } from './ActivityLogBaseView';
import { ActivityLogViewProps } from './ActivityLogViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityLogCardCommentCreatedViewProps extends ActivityLogViewProps {}

export const ActivityCardCommentCreatedView: FC<ActivityLogCardCommentCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.card-comment-created', { displayName: 'cardDisplayName' });

  return <ActivityLogBaseView action={action} {...props} />;
};
