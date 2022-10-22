import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { Community } from '../../../../../models/graphql-schema';
import { Author } from '../../AuthorAvatar/models/author';

export interface ActivityMemberJoinedViewProps extends ActivityViewProps {
  user2: Author;
  community: Community;
}

export const ActivityMemberJoinedView: FC<ActivityMemberJoinedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.member-joined');

  return <ActivityBaseView action={action} url={props.user2.avatarUrl} {...props} />;
};
