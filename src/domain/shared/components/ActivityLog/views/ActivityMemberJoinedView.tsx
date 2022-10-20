import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';

export interface ActivityMemberJoinedViewProps extends ActivityViewProps {}

export const ActivityMemberJoinedView: FC<ActivityMemberJoinedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.member-joined');

  return <ActivityBaseView action={action} {...props} />;
};
