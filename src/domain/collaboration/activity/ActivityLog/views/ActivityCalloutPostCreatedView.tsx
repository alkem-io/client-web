import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '@/domain/shared/types/ActivityCalloutValues';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

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
