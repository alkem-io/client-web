import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { AuthorModel } from '@/domain/community/user/models/AuthorModel';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

interface ActivityMemberJoinedViewProps extends ActivityViewProps {
  member: AuthorModel;
  type: ActivityEventType.MemberJoined;
}

export const ActivityMemberJoinedView = ({
  spaceDisplayName,
  member,
  type,
  ...rest
}: ActivityMemberJoinedViewProps) => (
  <ActivityBaseView
    {...rest}
    type={type}
    avatarUrl={member.avatarUrl}
    avatarAlt={member.displayName}
    title={<ActivityDescriptionByType activityType={type} subject={member.displayName} />}
    url={member.url}
    contextDisplayName={spaceDisplayName}
  />
);
