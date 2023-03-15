import React, { FC, useCallback } from 'react';
import {
  refetchHubCalendarEventsQuery,
  refetchHubDashboardCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useHubCalendarEventsQuery,
  useUpdateCalendarEventMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalendarEvent,
  CalendarEventDetailsFragment,
  Profile,
} from '../../../core/apollo/generated/graphql-schema';

export interface CalendarEventFormData
  extends Pick<CalendarEvent, 'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay'> {
  displayName: Profile['displayName'];
  description: Profile['description'];
  references: Profile['references'];
  tags: string[];
}

export interface CalendarEventsContainerProps {
  hubId: string;
  children: (
    entities: CalendarEventsEntities,
    actions: CalendarEventsActions,
    loading: CalendarEventsState
  ) => React.ReactNode;
  options?: {};
}

export interface CalendarEventsActions {
  // loadMore: () => void; // TODO: pagination?
  createEvent: (event: CalendarEventFormData) => Promise<string | undefined>;
  updateEvent: (
    eventId: string,
    tagsetid: string | undefined,
    event: CalendarEventFormData
  ) => Promise<string | undefined>;
  deleteEvent: (eventId: string) => Promise<string | undefined>;
}

export interface CalendarEventsState {
  loading: boolean;
  creatingCalendarEvent: boolean;
  updatingCalendarEvent: boolean;
  deletingCalendarEvent: boolean;
}

export interface CalendarEventsEntities {
  events: CalendarEventDetailsFragment[];
  privileges: {
    canCreateEvents: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
  };
}

export const CalendarEventsContainer: FC<CalendarEventsContainerProps> = ({ hubId, children }) => {
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

  const events = data?.hub.timeline?.calendar.events ?? [];

  const calendarId = data?.hub.timeline?.calendar.id;

  const [createCalendarEvent, { loading: creatingCalendarEvent }] = useCreateCalendarEventMutation();

  const [updateCalendarEvent, { loading: updatingCalendarEvent }] = useUpdateCalendarEventMutation();

  const [deleteCalendarEvent, { loading: deletingCalendarEvent }] = useDeleteCalendarEventMutation();

  const createEvent = useCallback(
    (event: CalendarEventFormData) => {
      const { startDate, description, tags, references, displayName, ...rest } = event;
      const parsedStartDate = startDate ? new Date(startDate) : new Date();

      return createCalendarEvent({
        variables: {
          eventData: {
            calendarID: calendarId!,
            startDate: parsedStartDate,
            tags: tags,
            ...rest,
            profileData: {
              description: description,
              displayName: displayName,
            },
          },
        },
        refetchQueries: [refetchHubCalendarEventsQuery({ hubId }), refetchHubDashboardCalendarEventsQuery({ hubId })],
        awaitRefetchQueries: true,
      }).then(result => result.data?.createEventOnCalendar?.nameID);
    },
    [createCalendarEvent, hubId, calendarId]
  );

  const updateEvent = useCallback(
    (eventId: string, tagsetId: string | undefined, event: CalendarEventFormData) => {
      const { startDate, description, tags, references, displayName, ...rest } = event;
      const parsedStartDate = startDate ? new Date(startDate) : new Date();

      return updateCalendarEvent({
        variables: {
          eventData: {
            ID: eventId,
            startDate: parsedStartDate,
            ...rest,
            profileData: {
              displayName: displayName,
              description: description,
              // references: ...references  // TODO...
              tagsets: [
                {
                  ID: tagsetId ?? '',
                  tags: tags,
                },
              ],
            },
          },
        },
        refetchQueries: [refetchHubCalendarEventsQuery({ hubId }), refetchHubDashboardCalendarEventsQuery({ hubId })],
        awaitRefetchQueries: true,
      }).then(result => result.data?.updateCalendarEvent?.nameID);
    },
    [updateCalendarEvent, hubId]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      return deleteCalendarEvent({
        variables: {
          deleteData: {
            ID: eventId,
          },
        },
        refetchQueries: [refetchHubCalendarEventsQuery({ hubId }), refetchHubDashboardCalendarEventsQuery({ hubId })],
        awaitRefetchQueries: true,
      }).then(result => result.data?.deleteCalendarEvent?.nameID);
    },
    [deleteCalendarEvent, hubId]
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
