import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityDiscussionCommentCreatedViewProps extends ActivityViewProps {}

export const ActivityDiscussionCommentCreatedView: FC<ActivityDiscussionCommentCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.discussion-comment-created');

  return <ActivityBaseView action={action} {...props} />;
};
