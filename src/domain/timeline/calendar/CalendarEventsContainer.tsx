import React, { FC, useCallback } from 'react';
import {
  refetchSpaceCalendarEventsQuery,
  refetchSpaceDashboardCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useSpaceCalendarEventsQuery,
  useUpdateCalendarEventMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalendarEvent,
  CalendarEventDetailsFragment,
  Profile,
} from '../../../core/apollo/generated/graphql-schema';
import { StorageConfigContextProvider } from '../../platform/storage/StorageBucket/StorageConfigContext';

export interface CalendarEventFormData
  extends Pick<CalendarEvent, 'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay'> {
  displayName: Profile['displayName'];
  description: Profile['description'];
  references: Profile['references'];
  tags: string[];
}

export interface CalendarEventsContainerProps {
  spaceId: string;
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

export const CalendarEventsContainer: FC<CalendarEventsContainerProps> = ({ spaceId, children }) => {
  const { data, loading } = useSpaceCalendarEventsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const privileges = {
    canCreateEvents: (data?.space.timeline?.calendar.authorization?.myPrivileges ?? []).some(
      p => p === AuthorizationPrivilege.Create
    ),
    canEditEvents: (data?.space.timeline?.calendar.authorization?.myPrivileges ?? []).some(
      p => p === AuthorizationPrivilege.Update
    ),
    canDeleteEvents: (data?.space.timeline?.calendar.authorization?.myPrivileges ?? []).some(
      p => p === AuthorizationPrivilege.Delete
    ),
  };

  const events = data?.space.timeline?.calendar.events ?? [];

  const calendarId = data?.space.timeline?.calendar.id;

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
        refetchQueries: [
          refetchSpaceCalendarEventsQuery({ spaceId }),
          refetchSpaceDashboardCalendarEventsQuery({ spaceId }),
        ],
        awaitRefetchQueries: true,
      }).then(result => result.data?.createEventOnCalendar?.nameID);
    },
    [createCalendarEvent, spaceId, calendarId]
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
        refetchQueries: [
          refetchSpaceCalendarEventsQuery({ spaceId }),
          refetchSpaceDashboardCalendarEventsQuery({ spaceId }),
        ],
        awaitRefetchQueries: true,
      }).then(result => result.data?.updateCalendarEvent?.nameID);
    },
    [updateCalendarEvent, spaceId]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      return deleteCalendarEvent({
        variables: {
          deleteData: {
            ID: eventId,
          },
        },
        refetchQueries: [
          refetchSpaceCalendarEventsQuery({ spaceId }),
          refetchSpaceDashboardCalendarEventsQuery({ spaceId }),
        ],
        awaitRefetchQueries: true,
      }).then(result => result.data?.deleteCalendarEvent?.nameID);
    },
    [deleteCalendarEvent, spaceId]
  );

  return (
    <StorageConfigContextProvider spaceNameId={spaceId} locationType="journey" journeyTypeName="space">
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
    </StorageConfigContextProvider>
  );
};
