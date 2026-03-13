import type { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import type { ActivityCalloutValues } from '@/domain/shared/types/ActivityCalloutValues';
import type { ActivitySubject } from '../types/ActivitySubject';
import { ActivityBaseView } from './ActivityBaseView';
import type { ActivityViewProps } from './ActivityViewProps';

interface ActivityCalloutPostCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  post: ActivitySubject;
  type: ActivityEventType.CalloutPostCreated;
}

export const ActivityCalloutPostCreatedView = ({
  callout,
  post,
  type,
  ...rest
}: ActivityCalloutPostCreatedViewProps) => (
  <ActivityBaseView
    type={type}
    title={<ActivityDescriptionByType activityType={type} subject={post.profile.displayName} />}
    url={post.profile.url}
    contextDisplayName={callout.framing.profile.displayName}
    {...rest}
  />
);
