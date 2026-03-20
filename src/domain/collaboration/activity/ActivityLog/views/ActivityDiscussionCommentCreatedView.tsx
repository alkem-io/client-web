import type { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import type { ActivityCalloutValues } from '@/domain/shared/types/ActivityCalloutValues';
import { ActivityBaseView } from './ActivityBaseView';
import ActivitySubjectMarkdown from './ActivitySubjectMarkdown';
import type { ActivityViewProps } from './ActivityViewProps';

interface ActivityDiscussionCommentCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  description: string;
  type: ActivityEventType.DiscussionComment;
}

export const ActivityDiscussionCommentCreatedView = ({
  callout,
  description,
  type,
  ...rest
}: ActivityDiscussionCommentCreatedViewProps) => (
  <ActivityBaseView
    type={type}
    title={<ActivitySubjectMarkdown>{description}</ActivitySubjectMarkdown>}
    url={callout.framing.profile.url}
    contextDisplayName={callout.framing.profile.displayName}
    {...rest}
  />
);
