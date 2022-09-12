import React, { FC } from 'react';
import { ActivityLogBaseView } from './ActivityLogBaseView';
import { ActivityLogViewProps } from './ActivityLogViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityLogDiscussionCommentCreatedViewProps extends ActivityLogViewProps {}

export const ActivityLogDiscussionCommentCreatedView: FC<ActivityLogDiscussionCommentCreatedViewProps> = ({
  author,
  createdDate,
  description,
}) => {
  const { t } = useTranslation();

  const action = t('components.activity-log-view.actions.discussion-comment-created');

  return <ActivityLogBaseView author={author} createdDate={createdDate} action={action} description={description} />;
};
