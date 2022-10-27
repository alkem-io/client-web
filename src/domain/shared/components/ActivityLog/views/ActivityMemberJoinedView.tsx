import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { Community } from '../../../../../models/graphql-schema';
import { Author } from '../../AuthorAvatar/models/author';

export interface ActivityMemberJoinedViewProps extends ActivityViewProps {
  member: Author;
  community: Community;
  communityType: string;
}

export const ActivityMemberJoinedView: FC<ActivityMemberJoinedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.member-joined');
  const url = props.member.url;
  const description = t('components.activity-log-view.activity-description.member-joined', {
    communityType: props.communityType,
    userDisplayName: props.member.displayName,
  });

  const resultProps: ActivityBaseViewProps = { ...props, action, url, description };

  return <ActivityBaseView {...resultProps} />;
};
