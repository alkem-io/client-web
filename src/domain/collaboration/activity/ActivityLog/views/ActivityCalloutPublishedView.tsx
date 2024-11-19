import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '@/domain/shared/types/ActivityCalloutValues';
import { ActivityEventType, CalloutType } from '@/core/apollo/generated/graphql-schema';

interface ActivityCalloutPublishedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues & { type: CalloutType };
  type: ActivityEventType.CalloutPublished;
}

export const ActivityCalloutPublishedView = ({
  journeyDisplayName,
  callout,
  type,
  ...rest
}: ActivityCalloutPublishedViewProps) => (
  <ActivityBaseView
    type={type}
    calloutType={callout.type}
    title={<ActivityDescriptionByType activityType={type} subject={callout.framing.profile.displayName} />}
    url={callout.framing.profile.url}
    contextDisplayName={journeyDisplayName}
    {...rest}
  />
);
