import React, { FC, useCallback } from 'react';
import { useCreateCalendarEventMutation, useDeleteCalendarEventMutation, useHubCalendarEventsQuery, useUpdateCalendarEventMutation } from '../../../core/apollo/generated/apollo-hooks';
import { CalendarEvent, CardProfile } from '../../../core/apollo/generated/graphql-schema';
import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';

export interface CalendarEventForm
  extends Pick<CalendarEvent, 'displayName' | 'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay'> {
    description: CardProfile['description'];
    references: CardProfile['references'];
    tags: string[];
}

/*export interface CalendarEventView
  extends Pick<CalendarEvent, 'id' | 'nameID' | 'displayName' | 'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay'> {
    description: CardProfile['description'];
    references: CardProfile['references'];
    tags: string[];
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
  events: Partial<CalendarEvent>[];
}


export const CalendarEventsContainer: FC<CalendarEventsContainerProps> = ({ hubId, children }) => {
  const handleError = useApolloErrorHandler();

  const { data, loading } = useHubCalendarEventsQuery({
    variables: { hubId: hubId!},
    skip: !hubId,
  });
  /*const events: CalendarEventView[] = (data?.hub.timeline?.calendar.events ?? []).map(
    event => ({
      id: event.id,
      displayName: event.displayName,
      startDate: event.startDate,
      description: event.profile?.description,
    }));
    */
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
