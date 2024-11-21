import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '@/domain/shared/types/ActivityCalloutValues';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

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
