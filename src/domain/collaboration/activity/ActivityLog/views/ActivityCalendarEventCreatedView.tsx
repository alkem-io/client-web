import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

export interface ActivityCalendarEventCreatedViewProps extends ActivityViewProps {
  calendarEvent: {
    profile: {
      displayName: string;
      url: string;
    };
  };
  type: ActivityEventType.CalendarEventCreated;
}

export const ActivityCalendarEventCreatedView = ({
  spaceDisplayName,
  calendarEvent,
  type,
  ...rest
}: ActivityCalendarEventCreatedViewProps) => (
  <ActivityBaseView
    type={type}
    title={<ActivityDescriptionByType activityType={type} subject={calendarEvent.profile.displayName} />}
    url={calendarEvent.profile.url}
    contextDisplayName={spaceDisplayName}
    {...rest}
  />
);
