import type { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import type { ActivityCalloutValues } from '@/domain/shared/types/ActivityCalloutValues';
import { ActivityBaseView } from './ActivityBaseView';
import type { ActivityViewProps } from './ActivityViewProps';

interface ActivityCalloutPublishedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  type: ActivityEventType.CalloutPublished;
}

export const ActivityCalloutPublishedView = ({
  spaceDisplayName,
  callout,
  type,
  ...rest
}: ActivityCalloutPublishedViewProps) => (
  <ActivityBaseView
    type={type}
    title={<ActivityDescriptionByType activityType={type} subject={callout.framing.profile.displayName} />}
    url={callout.framing.profile.url}
    contextDisplayName={spaceDisplayName}
    {...rest}
  />
);
