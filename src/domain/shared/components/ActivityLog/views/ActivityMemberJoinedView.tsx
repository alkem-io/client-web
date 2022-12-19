import React, { FC } from 'react';
import { ActivityBaseView, ActivityBaseViewProps } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { Community } from '../../../../../core/apollo/generated/graphql-schema';
import { Author } from '../../AuthorAvatar/models/author';

export interface ActivityMemberJoinedViewProps extends ActivityViewProps {
  member: Author;
  community: Community;
  communityType: string;
}

export const ActivityMemberJoinedView: FC<ActivityMemberJoinedViewProps> = props => {
  const { t } = useTranslation();
  const action = t('components.activity-log-view.actions.member-joined', {
    journeyType: props.communityType,
    journeyDisplayName: props.community.displayName,
    interpolation: {
      escapeValue: false,
    },
  });
  const url = props.member.url;
  const description = t('components.activity-log-view.activity-description.member-joined', {
    userDisplayName: props.member.displayName,
    interpolation: {
      escapeValue: false,
    },
  });

  const resultProps: ActivityBaseViewProps = { ...props, action, url };

  return <ActivityBaseView {...resultProps}>{description}</ActivityBaseView>;
};
