import React, { FC, useCallback } from 'react';
import {
  refetchChallengeCalendarEventsQuery,
  refetchChallengeDashboardCalendarEventsQuery,
  refetchOpportunityCalendarEventsQuery,
  refetchOpportunityDashboardCalendarEventsQuery,
  refetchSpaceCalendarEventsQuery,
  refetchSpaceDashboardCalendarEventsQuery,
  useChallengeCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useOpportunityCalendarEventsQuery,
  useSpaceCalendarEventsQuery,
  useUpdateCalendarEventMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalendarEvent,
  CalendarEventInfoFragment,
  Profile,
} from '../../../core/apollo/generated/graphql-schema';
import { StorageConfigContextProvider } from '../../storage/StorageBucket/StorageConfigContext';
import { MutationBaseOptions } from '@apollo/client/core/watchQueryOptions';
import { JourneyTypeName } from '../../journey/JourneyTypeName';

export interface CalendarEventFormData
  extends Pick<CalendarEvent, 'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay'> {
  displayName: Profile['displayName'];
  description: Profile['description'];
  references: Profile['references'];
  tags: string[];
}

export interface CalendarEventsContainerProps {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
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
}

export interface CalendarEventsEntities {
  events: CalendarEventInfoFragment[];
  privileges: {
    canCreateEvents: boolean;
    canEditEvents: boolean;
    canDeleteEvents: boolean;
  };
}

export const CalendarEventsContainer: FC<CalendarEventsContainerProps> = ({ journeyId, journeyTypeName, children }) => {
  const { data: opportunityData, loading: loadingOpportunity } = useOpportunityCalendarEventsQuery({
    variables: { opportunityId: journeyId! },
    skip: !journeyId || journeyTypeName !== 'opportunity',
  });

  const { data: challengeData, loading: loadingChallenge } = useChallengeCalendarEventsQuery({
    variables: { challengeId: journeyId! },
    skip: !journeyId || journeyTypeName !== 'challenge',
  });

  const { data: spaceData, loading: loadingSpace } = useSpaceCalendarEventsQuery({
    variables: { spaceId: journeyId! },
    skip: !journeyId || journeyTypeName !== 'space',
  });

  const loading = loadingOpportunity || loadingChallenge || loadingSpace;

  const collaboration =
    opportunityData?.lookup.opportunity?.collaboration ??
    challengeData?.lookup.challenge?.collaboration ??
    spaceData?.space.collaboration;

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

  if (journeyTypeName === 'opportunity') {
    refetchQueriesList = [
      refetchOpportunityCalendarEventsQuery({ opportunityId: journeyId! }),
      refetchOpportunityDashboardCalendarEventsQuery({ opportunityId: journeyId! }),
    ];
  } else if (journeyTypeName === 'challenge') {
    refetchQueriesList = [
      refetchChallengeCalendarEventsQuery({ challengeId: journeyId! }),
      refetchChallengeDashboardCalendarEventsQuery({ challengeId: journeyId! }),
    ];
  } else if (journeyTypeName === 'space') {
    refetchQueriesList = [
      refetchSpaceCalendarEventsQuery({ spaceId: journeyId! }),
      refetchSpaceDashboardCalendarEventsQuery({ spaceId: journeyId! }),
    ];
  }

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
        refetchQueries: refetchQueriesList,
        awaitRefetchQueries: true,
      }).then(result => result.data?.createEventOnCalendar?.nameID);
    },
    [createCalendarEvent, calendarId]
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
        refetchQueries: refetchQueriesList,
        awaitRefetchQueries: true,
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
        refetchQueries: refetchQueriesList,
        awaitRefetchQueries: true,
      }).then(result => result.data?.deleteCalendarEvent?.nameID);
    },
    [deleteCalendarEvent]
  );

  return (
    <StorageConfigContextProvider journeyId={journeyId} locationType="journey" journeyTypeName={journeyTypeName}>
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
