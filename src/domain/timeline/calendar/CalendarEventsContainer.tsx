import React, { FC, useCallback } from 'react';
import { useCreateCalendarEventMutation, useDeleteCalendarEventMutation, useHubCalendarEventsQuery, useUpdateCalendarEventMutation } from '../../../core/apollo/generated/apollo-hooks';
import { CalendarEvent, CardProfile } from '../../../core/apollo/generated/graphql-schema';
import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';
import { CalendarEventCardData } from './views/CalendarEventCard';

export interface CalendarEventForm
  extends Pick<CalendarEvent, 'displayName' | 'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay'> {
    description: CardProfile['description'];
    references: CardProfile['references'];
    tags: string[];
}

/* export interface CalendarEventView
  extends Pick<CalendarEvent, 'id' | 'nameID' | 'displayName' | 'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay' | 'createdDate'> {
    createdBy: Partial<CalendarEvent['createdBy']>;
    description: CardProfile['description'] | undefined;
    references: CardProfile['references'];
    tags: string[] | undefined;
}*/

export interface CalendarEventsContainerProps {
  hubId: string;
  children: (
    entities: CalendarEventsEntities,
    actions: CalendarEventsActions,
    loading: CalendarEventsState
  ) => React.ReactNode;
}

export interface CalendarEventsActions {
  // loadMore: () => void; // TODO: pagination?
  createEvent: (event: CalendarEventForm) => Promise<string | undefined>;
  updateEvent: (eventId: string, event: CalendarEventForm) => Promise<string | undefined>;
  deleteEvent: (eventId: string) => Promise<string | undefined>;
}

export interface CalendarEventsState {
  loading: boolean;
  creatingCalendarEvent: boolean;
  updatingCalendarEvent: boolean;
  deletingCalendarEvent: boolean;
}

export interface CalendarEventsEntities {
  events: CalendarEventCardData[];
}


export const CalendarEventsContainer: FC<CalendarEventsContainerProps> = ({ hubId, children }) => {
  const handleError = useApolloErrorHandler();

  const { data, loading } = useHubCalendarEventsQuery({
    variables: { hubId: hubId!},
    skip: !hubId,
  });
/*  const events: CalendarEventView[] = (data?.hub.timeline?.calendar.events ?? []).map(
    event => ({
      id: event.id,
      nameID: event.nameID,
      displayName: event.displayName,
      durationDays: event.durationDays,
      durationMinutes: event.durationMinutes,
      multipleDays: event.multipleDays,
      startDate: event.startDate,
      type: event.type,
      wholeDay: event.wholeDay,
      createdBy: event.createdBy,
      createdDate: event.createdDate,
      description: event.profile?.description,
      references: event.profile?.references,
      tags: event.profile?.tagset?.tags
    }));*/
  const events = data?.hub.timeline?.calendar.events ?? [];

  const calendarId = data?.hub.timeline?.calendar.id;

  const [createCalendarEvent, { loading: creatingCalendarEvent }] = useCreateCalendarEventMutation({
    onError: handleError,
  });

  const [updateCalendarEvent, { loading: updatingCalendarEvent }] = useUpdateCalendarEventMutation({
    onError: handleError,
  });

  const [deleteCalendarEvent, { loading: deletingCalendarEvent }] = useDeleteCalendarEventMutation({
    onError: handleError,
  });

  const createEvent = useCallback(
    (event: CalendarEventForm) => {
      const { startDate, description, tags, references, ...rest } = event;
      const parsedStartDate = startDate ? new Date(startDate) : new Date();//!!

      return createCalendarEvent({
        variables: {
          eventData: {
            calendarID: calendarId!,
            startDate: parsedStartDate,
            ...rest,
            profileData: {
              description: description,
              // referencesData: ... references
              tags: tags
            }
          },
        }
      }).then(result => result.data?.createEventOnCalendar?.nameID)
    },
    [createCalendarEvent, calendarId]
  );

  const updateEvent = useCallback(
    (eventId: string, event: CalendarEventForm) => {
      const { startDate, description, tags, references, ...rest } = event;
      const parsedStartDate = startDate ? new Date(startDate) : new Date(); //!!

      return updateCalendarEvent({
        variables: {
          eventData: {
            ID: eventId,
            startDate: parsedStartDate,
            ...rest,
            profileData: {
              description: description,
              // references: ...references  //!!
              tags: tags
            }
          },
        }
      }).then(result => result.data?.updateCalendarEvent?.nameID)
    },
    [updateCalendarEvent]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      return deleteCalendarEvent({
        variables: {
          deleteData: {
            ID: eventId,
          },
        }
      }).then(result => result.data?.deleteCalendarEvent?.nameID)
    },
    [deleteCalendarEvent]
  );

  return (
    <>
      {children(
        { events },
        { createEvent, updateEvent, deleteEvent },
        {
          loading,
          creatingCalendarEvent,
          updatingCalendarEvent,
          deletingCalendarEvent,
        }
      )}
    </>
  );
};
