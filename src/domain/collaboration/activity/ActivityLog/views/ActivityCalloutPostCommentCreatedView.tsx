import type { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import type { ActivitySubject } from '../types/ActivitySubject';
import { ActivityBaseView } from './ActivityBaseView';
import ActivitySubjectMarkdown from './ActivitySubjectMarkdown';
import type { ActivityViewProps } from './ActivityViewProps';

interface ActivityCalloutPostCommentCreatedViewProps extends ActivityViewProps {
  post: ActivitySubject;
  description: string;
  type: ActivityEventType.CalloutPostComment;
}

export const ActivityCalloutPostCommentCreatedView = ({
  post,
  description,
  type,
  ...rest
}: ActivityCalloutPostCommentCreatedViewProps) => (
  <ActivityBaseView
    type={type}
    title={<ActivitySubjectMarkdown>{description}</ActivitySubjectMarkdown>}
    url={post.profile.url}
    contextDisplayName={post.profile.displayName}
    {...rest}
  />
);
