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
  avatarUrl,
  loading,
  createdDate,
  journeyDisplayName,
  calendarEvent,
  type,
}) => {
  return (
    <ActivityBaseView
      avatarUrl={avatarUrl}
      loading={loading}
      type={type}
      title={<ActivityDescriptionByType activityType={type} subject={calendarEvent.profile.displayName} />}
      url={calendarEvent.profile.url}
      contextDisplayName={journeyDisplayName}
      createdDate={createdDate}
    />
  );
};
