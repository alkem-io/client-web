import React, { FC, useCallback } from 'react';
import { useCreateCalendarEventMutation, useDeleteCalendarEventMutation, useUpdateCalendarEventMutation } from '../../../core/apollo/generated/apollo-hooks';
import { CalendarEvent, CreateCalendarEventOnCalendarInput, UpdateCalendarEventInput, DeleteCalendarEventInput, CardProfile } from '../../../core/apollo/generated/graphql-schema';
import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';

export interface CalendarEventForm extends Pick<CalendarEvent, 'displayName' | 'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay'> {
  description: CardProfile['description'];
  references: CardProfile['references'];
  tags: string[];
}

export interface CalendarEventsContainerProps {
  hubId: string;
  calendarId: string;
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
  events: {
    title: string;
    startDate: Date;
  }
}


export const CalendarEventsContainer: FC<CalendarEventsContainerProps> = ({ hubId, calendarId, children }) => {
  const handleError = useApolloErrorHandler();

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
    (calendarEvent: CalendarEventForm) => {
      const { startDate, description, tags, references, ...rest } = calendarEvent;
      const parsedStartDate = startDate ? new Date(startDate) : new Date();

      createCalendarEvent({
        variables: {
          eventData: {
            calendarID: calendarId,
            startDate: parsedStartDate,
            ...rest,
            profileData: {
              description: description,
              // referencesData: ... references
              tags: tags
            }
          },
        }
      });
    },
    [createCalendarEvent, calendarId]
  );


  return (
    <>
      {children(
        { events },
        { loadMore, createEvent, updateEvent, deleteEvent },
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
