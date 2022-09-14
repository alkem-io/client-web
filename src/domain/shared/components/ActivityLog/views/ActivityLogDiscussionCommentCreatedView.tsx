import React, { FC } from 'react';
import { ActivityLogBaseView } from './ActivityLogBaseView';
import { ActivityLogViewProps } from './ActivityLogViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityLogDiscussionCommentCreatedViewProps extends ActivityLogViewProps {}

export const ActivityLogDiscussionCommentCreatedView: FC<ActivityLogDiscussionCommentCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.discussion-comment-created');

  return <ActivityLogBaseView action={action} {...props} />;
};
