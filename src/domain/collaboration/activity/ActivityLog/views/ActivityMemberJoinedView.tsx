import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { Author } from '../../../../shared/components/AuthorAvatar/models/author';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';

interface ActivityMemberJoinedViewProps extends ActivityViewProps {
  member: Author;
  type: ActivityEventType.MemberJoined;
}

export const ActivityMemberJoinedView: FC<ActivityMemberJoinedViewProps> = ({
  loading,
  createdDate,
  journeyDisplayName,
  member,
  type,
  footerComponent,
}) => {
  return (
    <ActivityBaseView
      type={type}
      author={member} // Important to show the user that joined, not the person that triggered it
      loading={loading}
      title={<ActivityDescriptionByType activityType={type} subject={member.displayName} />}
      url={member.url}
      footerComponent={footerComponent}
      contextDisplayName={journeyDisplayName}
      createdDate={createdDate}
    />
  );
};
