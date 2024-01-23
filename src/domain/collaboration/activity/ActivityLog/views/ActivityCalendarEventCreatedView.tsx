import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';

export interface ActivityCalendarEventCreatedViewProps extends ActivityViewProps {
  calendarEvent: {
    profile: {
      displayName: string;
      url: string;
    };
  };
  type: ActivityEventType.CalendarEventCreated;
}

export const ActivityCalendarEventCreatedView: FC<ActivityCalendarEventCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyDisplayName,
  calendarEvent,
  type,
  footerComponent,
}) => {
  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      type={type}
      title={<ActivityDescriptionByType activityType={type} subject={calendarEvent.profile.displayName} />}
      url={calendarEvent.profile.url}
      footerComponent={footerComponent}
      contextDisplayName={journeyDisplayName}
      createdDate={createdDate}
    />
  );
};
