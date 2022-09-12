import React, { FC } from 'react';
import { ActivityLogBaseView } from './ActivityLogBaseView';
import { ActivityLogViewProps } from './ActivityLogViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityLogmemberJoinedViewProps extends ActivityLogViewProps {}

export const ActivityLogMemberJoinedView: FC<ActivityLogmemberJoinedViewProps> = ({
  author,
  createdDate,
  description,
}) => {
  const { t } = useTranslation();

  const action = t('components.activity-log-view.actions.member-joined');

  return <ActivityLogBaseView author={author} createdDate={createdDate} action={action} description={description} />;
};
