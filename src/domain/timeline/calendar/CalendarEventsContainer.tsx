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
} from '@/core/apollo/generated/graphql-schema';
import { isSameDay } from '@/core/utils/time/utils';
import {
  mapProfileModelToCreateProfileInput,
  mapProfileModelToUpdateProfileInput,
} from '@/domain/common/profile/ProfileModelUtils';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { MutationBaseOptions } from '@apollo/client/core/watchQueryOptions';
import React, { useCallback } from 'react';
import { LocationModel } from '@/domain/common/location/LocationModel';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';

export interface CalendarEventFormData
  extends Pick<
    CalendarEvent,
    'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay' | 'visibleOnParentCalendar'
  > {
  endDate: number | Date;
  displayName: string;
  description: string;
  location: LocationModel;
  references: ReferenceModel[];
  tags: string[];
}

export interface CalendarEventsContainerProps {
  spaceId: string | undefined;
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
  updateEvent: (eventId: string, event: CalendarEventFormData, tagset: TagsetModel) => Promise<string | undefined>;
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

export const CalendarEventsContainer = ({ spaceId, parentSpaceId, children }: CalendarEventsContainerProps) => {
  const { data: spaceData, loading } = useSpaceCalendarEventsQuery({
    variables: { spaceId: spaceId!, includeSubspace: !parentSpaceId },
    skip: !spaceId,
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

  refetchQueriesList = [refetchSpaceCalendarEventsQuery({ spaceId: spaceId! })];

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
            profileData: mapProfileModelToCreateProfileInput({
              description,
              displayName,
              location: {
                id: '',
                city: location?.city,
              },
            }),
          },
        },
        refetchQueries: refetchQueriesList,
        awaitRefetchQueries: true,
      }).then(result => result.data?.createEventOnCalendar?.profile.url);
    },
    [createCalendarEvent, calendarId]
  );

  const updateEvent = useCallback(
    (eventId: string, event: CalendarEventFormData, tagset: TagsetModel) => {
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

      const updatedTagset = { ...tagset };
      updatedTagset.tags = [...tags];

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
            profileData: mapProfileModelToUpdateProfileInput({
              displayName: displayName,
              description: description,
              tagsets: [updatedTagset],
              location: {
                id: location?.id ?? '',
                city: location?.city,
              },
            }),
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
    <StorageConfigContextProvider spaceId={spaceId} locationType="space">
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
