import type { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import type { ActivityCalloutValues } from '@/domain/shared/types/ActivityCalloutValues';
import { ActivityBaseView } from './ActivityBaseView';
import type { ActivityViewProps } from './ActivityViewProps';

interface ActivityCalloutLinkCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  link: {
    profile: {
      displayName: string;
    };
  };
  type: ActivityEventType.CalloutLinkCreated;
}

export const ActivityCalloutLinkCreatedView = ({
  callout,
  link,
  type,
  ...rest
}: ActivityCalloutLinkCreatedViewProps) => (
  <ActivityBaseView
    type={type}
    title={<ActivityDescriptionByType activityType={type} subject={link.profile.displayName} />}
    url={callout.framing.profile.url}
    contextDisplayName={callout.framing.profile.displayName}
    {...rest}
  />
);
