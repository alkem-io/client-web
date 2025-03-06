import {
  refetchSpaceCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useSpaceCalendarEventsQuery,
  useUpdateCalendarEventMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalendarEvent,
  CalendarEventInfoFragment,
  Profile,
} from '@/core/apollo/generated/graphql-schema';
import { isSameDay } from '@/core/utils/time/utils';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { MutationBaseOptions } from '@apollo/client/core/watchQueryOptions';
import React, { useCallback } from 'react';

export interface CalendarEventFormData
  extends Pick<
    CalendarEvent,
    'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay' | 'visibleOnParentCalendar'
  > {
  endDate: number | Date;
  displayName: Profile['displayName'];
  description: Profile['description'];
  location: Profile['location'];
  references: Profile['references'];
  tags: string[];
}

export interface CalendarEventsContainerProps {
  journeyId: string | undefined;
  parentSpaceId: string | undefined;
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
  deleteEvent: (eventId: string) => Promise<void>;
}

export interface CalendarEventsState {
  loading: boolean;
  creatingCalendarEvent: boolean;
  updatingCalendarEvent: boolean;
}

export interface CalendarEventsEntities {
  events: CalendarEventInfoFragment[];
  privileges: {
    canCreateEvents: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
  };
}

export const CalendarEventsContainer = ({ journeyId, parentSpaceId, children }: CalendarEventsContainerProps) => {
  const { data: spaceData, loading } = useSpaceCalendarEventsQuery({
    variables: { spaceId: journeyId!, includeSubspace: !Boolean(parentSpaceId) },
    skip: !journeyId,
  });

  const collaboration = spaceData?.lookup.space?.collaboration;

  const myPrivileges = collaboration?.timeline?.calendar.authorization?.myPrivileges;

  const privileges = {
    canCreateEvents: (myPrivileges ?? []).includes(AuthorizationPrivilege.Create),
    canEditEvents: (myPrivileges ?? []).includes(AuthorizationPrivilege.Update),
    canDeleteEvents: (myPrivileges ?? []).includes(AuthorizationPrivilege.Delete),
  };

  const events = collaboration?.timeline?.calendar.events ?? [];

  const calendarId = collaboration?.timeline?.calendar.id;

  const [createCalendarEvent, { loading: creatingCalendarEvent }] = useCreateCalendarEventMutation();

  const [updateCalendarEvent, { loading: updatingCalendarEvent }] = useUpdateCalendarEventMutation();

  const [deleteCalendarEvent] = useDeleteCalendarEventMutation();

  let refetchQueriesList: MutationBaseOptions['refetchQueries'] = [];

  refetchQueriesList = [refetchSpaceCalendarEventsQuery({ spaceId: journeyId! })];

  if (parentSpaceId) {
    refetchQueriesList.push(refetchSpaceCalendarEventsQuery({ spaceId: parentSpaceId! }));
  }

  const createEvent = useCallback(
    (event: CalendarEventFormData) => {
      const { startDate, description, tags, references, displayName, endDate, location, wholeDay, ...rest } = event;
      const parsedStartDate = startDate ? new Date(startDate) : new Date();
      let durationMinutes = rest.durationMinutes;
      let durationDays = 0;
      let multipleDays = false;

      if (!isSameDay(startDate, endDate) && !wholeDay) {
        const parsedEndDate = endDate ? new Date(endDate) : new Date();
        durationMinutes = Math.floor((parsedEndDate.getTime() - parsedStartDate.getTime()) / 60000);
        durationDays = Math.floor(durationMinutes / (24 * 60));
        multipleDays = durationDays > 0;
      }

      return createCalendarEvent({
        variables: {
          eventData: {
            calendarID: calendarId!,
            startDate: parsedStartDate,
            tags: tags,
            ...rest,
            durationMinutes,
            durationDays,
            multipleDays,
            wholeDay,
            profileData: {
              description: description,
              displayName: displayName,
              location: {
                city: location?.city,
              },
            },
          },
        },
        refetchQueries: refetchQueriesList,
        awaitRefetchQueries: true,
      }).then(result => result.data?.createEventOnCalendar?.profile.url);
    },
    [createCalendarEvent, calendarId]
  );

  const updateEvent = useCallback(
    (eventId: string, tagsetId: string | undefined, event: CalendarEventFormData) => {
      const { startDate, description, tags, references, displayName, endDate, location, wholeDay, ...rest } = event;
      const parsedStartDate = startDate ? new Date(startDate) : new Date();

      // todo:b reuse
      let durationMinutes = rest.durationMinutes;
      let durationDays = 0;
      let multipleDays = false;

      if (!isSameDay(startDate, endDate) && !wholeDay) {
        const parsedEndDate = endDate ? new Date(endDate) : new Date();
        durationMinutes = Math.floor((parsedEndDate.getTime() - parsedStartDate.getTime()) / 60000);
        durationDays = Math.floor(durationMinutes / (24 * 60));
        multipleDays = durationDays > 0;
      }

      return updateCalendarEvent({
        variables: {
          eventData: {
            ID: eventId,
            startDate: parsedStartDate,
            ...rest,
            durationMinutes,
            durationDays,
            multipleDays,
            wholeDay,
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
              location: {
                city: location?.city,
              },
            },
          },
        },
        refetchQueries: refetchQueriesList,
        awaitRefetchQueries: true,
      }).then(result => result.data?.updateCalendarEvent?.profile.url);
    },
    [updateCalendarEvent]
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      await deleteCalendarEvent({
        variables: {
          deleteData: {
            ID: eventId,
          },
        },
        refetchQueries: refetchQueriesList,
        awaitRefetchQueries: true,
      });
    },
    [deleteCalendarEvent]
  );

  return (
    <StorageConfigContextProvider spaceId={journeyId} locationType="journey">
      {children(
        { events, privileges },
        { createEvent, updateEvent, deleteEvent },
        {
          loading,
          creatingCalendarEvent,
          updatingCalendarEvent,
        }
      )}
    </StorageConfigContextProvider>
  );
};
