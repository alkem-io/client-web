import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { Author } from '../../../../shared/components/AuthorAvatar/models/author';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '@core/apollo/generated/graphql-schema';

interface ActivityMemberJoinedViewProps extends ActivityViewProps {
  member: Author;
  type: ActivityEventType.MemberJoined;
}

export const ActivityMemberJoinedView: FC<ActivityMemberJoinedViewProps> = ({
  journeyDisplayName,
  member,
  type,
  ...rest
}) => {
  return (
    <ActivityBaseView
      {...rest}
      type={type}
      avatarUrl={member.avatarUrl}
      title={<ActivityDescriptionByType activityType={type} subject={member.displayName} />}
      url={member.url}
      contextDisplayName={journeyDisplayName}
    />
  );
};
