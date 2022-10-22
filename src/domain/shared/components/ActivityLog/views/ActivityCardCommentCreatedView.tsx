import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityCardCommentCreatedViewProps extends ActivityViewProps {}

export const ActivityCardCommentCreatedView: FC<ActivityCardCommentCreatedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.card-comment-created');

  return <ActivityBaseView action={action} url={url} {...props} />;
};
