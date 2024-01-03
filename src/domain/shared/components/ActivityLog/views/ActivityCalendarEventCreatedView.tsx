import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { useTranslation } from 'react-i18next';
import { NameableEntity } from '../../../types/NameableEntity';
import OneLineMarkdown from '../../../../../core/ui/markdown/OneLineMarkdown';
import ActivityDescriptionByType from '../../ActivityDescription/ActivityDescriptionByType';
import { buildEventUrl } from '../../../../../main/routing/urlBuilders';

export interface ActivityCalendarEventCreatedViewProps extends ActivityViewProps {
  calendarEvent: NameableEntity;
  calendarEventDescription: string;
}

export const ActivityCalendarEventCreatedView: FC<ActivityCalendarEventCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  journeyTypeName,
  journeyUrl,
  journeyDisplayName,
  calendarEvent,
  calendarEventDescription,
}) => {
  const { t } = useTranslation();

  const description = t('components.activity-log-view.activity-description.calendar-event-created', {
    eventDisplayName: calendarEvent.profile.displayName,
    eventDescription: calendarEventDescription,
  });

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      title={
        <ActivityDescriptionByType
          activityType="calendar-event-created"
          {...{
            author,
            createdDate,
            journeyTypeName,
            journeyUrl,
            journeyDisplayName,
            values: {
              eventDisplayName: calendarEvent.profile.displayName,
            },
          }}
          withLinkToParent={Boolean(journeyTypeName)}
        />
      }
      url={buildEventUrl(calendarEvent.nameID, journeyUrl)}
    >
      <OneLineMarkdown>{description}</OneLineMarkdown>
    </ActivityBaseView>
  );
};
