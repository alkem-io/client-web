import React, { FC, useCallback, useMemo } from 'react';
import {
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useHubCalendarEventsQuery,
  useUpdateCalendarEventMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalendarEvent,
  CardProfile,
  HubCalendarEventsQuery,
} from '../../../core/apollo/generated/graphql-schema';
import { useApolloErrorHandler } from '../../../core/apollo/hooks/useApolloErrorHandler';
import { CalendarEventCardData } from './views/CalendarEventCard';
import { extend, sortBy } from 'lodash';

export interface CalendarEventFormData
  extends Pick<
    CalendarEvent,
    'displayName' | 'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay'
  > {
  description: CardProfile['description'];
  references: CardProfile['references'];
  tags: string[];
}

export interface CalendarEventsContainerProps {
  hubId: string;
  children: (
    entities: CalendarEventsEntities,
    actions: CalendarEventsActions,
    loading: CalendarEventsState
  ) => React.ReactNode;
  options?: {
    sortByStartDate?: boolean;
    filterPastEvents?: boolean;
  };
}

export interface CalendarEventsActions {
  // loadMore: () => void; // TODO: pagination?
  createEvent: (event: CalendarEventFormData) => Promise<string | undefined>;
  updateEvent: (eventId: string, event: CalendarEventFormData) => Promise<string | undefined>;
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
  privileges: {
    canCreateEvents: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
  };
}

export const CalendarEventsContainer: FC<CalendarEventsContainerProps> = ({ hubId, children, options = {} }) => {
  const handleError = useApolloErrorHandler();
  const defaultOptions = {
    sortByStartDate: true,
    filterPastEvents: true,
  };
  const { sortByStartDate, filterPastEvents } = extend(options, defaultOptions);

  const { data, loading } = useHubCalendarEventsQuery({
    variables: { hubId: hubId! },
    skip: !hubId,
  });

  const privileges = {
    canCreateEvents: (data?.hub.timeline?.calendar.authorization?.myPrivileges ?? []).some(
      p => p === AuthorizationPrivilege.Create
    ),
    canEditEvents: (data?.hub.timeline?.calendar.authorization?.myPrivileges ?? []).some(
      p => p === AuthorizationPrivilege.Update
    ),
    canDeleteEvents: (data?.hub.timeline?.calendar.authorization?.myPrivileges ?? []).some(
      p => p === AuthorizationPrivilege.Delete
    ),
  };

  const events = useMemo(() => {
    let result: Required<HubCalendarEventsQuery['hub']>['timeline']['calendar']['events'] =
      data?.hub.timeline?.calendar.events ?? [];
    if (sortByStartDate) {
      result = sortBy(result, event => event.startDate);
    }
    if (filterPastEvents) {
      const now = new Date();
      result = result.filter(event => event.startDate && new Date(event.startDate) > now);
    }
    return result;
  }, [data, sortByStartDate, filterPastEvents]);

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
    (event: CalendarEventFormData) => {
      const { startDate, description, tags, references, ...rest } = event;
      const parsedStartDate = startDate ? new Date(startDate) : new Date(); //!!

      return createCalendarEvent({
        variables: {
          eventData: {
            calendarID: calendarId!,
            startDate: parsedStartDate,
            ...rest,
            profileData: {
              description: description,
              // referencesData: ... references
              tags: tags,
            },
          },
        },
      }).then(result => result.data?.createEventOnCalendar?.nameID);
    },
    [createCalendarEvent, calendarId]
  );

  const updateEvent = useCallback(
    (eventId: string, event: CalendarEventFormData) => {
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
              tags: tags,
            },
          },
        },
      }).then(result => result.data?.updateCalendarEvent?.nameID);
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
        },
      }).then(result => result.data?.deleteCalendarEvent?.nameID);
    },
    [deleteCalendarEvent]
  );

  return (
    <>
      {children(
        { events, privileges },
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
