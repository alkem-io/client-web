import React, { FC } from 'react';
import { ActivityLogBaseView } from './ActivityLogBaseView';
import { ActivityLogViewProps } from './ActivityLogViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityLogmemberJoinedViewProps extends ActivityLogViewProps {}

export const ActivityLogMemberJoinedView: FC<ActivityLogmemberJoinedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.member-joined');

  return <ActivityLogBaseView action={action} {...props} />;
};
