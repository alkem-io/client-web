import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { Author } from '@/domain/shared/components/AuthorAvatar/models/author';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

interface ActivityMemberJoinedViewProps extends ActivityViewProps {
  member: Author;
  type: ActivityEventType.MemberJoined;
}

export const ActivityMemberJoinedView = ({
  journeyDisplayName,
  member,
  type,
  ...rest
}: ActivityMemberJoinedViewProps) => (
  <ActivityBaseView
    {...rest}
    type={type}
    avatarUrl={member.avatarUrl}
    title={<ActivityDescriptionByType activityType={type} subject={member.displayName} />}
    url={member.url}
    contextDisplayName={journeyDisplayName}
  />
);
