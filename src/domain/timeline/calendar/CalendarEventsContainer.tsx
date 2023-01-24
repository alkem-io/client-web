import React, { FC, useCallback } from 'react';
import { useCreateCalendarEventMutation, useDeleteCalendarEventMutation, useUpdateCalendarEventMutation } from '../../../core/apollo/generated/apollo-hooks';
import { CalendarEvent, CreateCalendarEventOnCalendarInput, UpdateCalendarEventInput, DeleteCalendarEventInput } from '../../../core/apollo/generated/graphql-schema';
import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';

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
  addEvent: (event: CreateCalendarEventOnCalendarInput) => Promise<string | undefined>;
  updateEvent: (event: UpdateCalendarEventInput) => Promise<string | undefined>;
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


export const CalendarEventsContainer: FC<CalendarEventsContainerProps> = ({ hubId, children }) => {
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

  return (
    <>
      {children(
        { events },
        { loadMore, addEvent, updateEvent, deleteEvent },
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
