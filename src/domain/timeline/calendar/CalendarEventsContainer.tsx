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
  CalendarEventDetailsFragment,
  Profile,
} from '../../../core/apollo/generated/graphql-schema';
import { StorageConfigContextProvider } from '../../storage/StorageBucket/StorageConfigContext';
import { MutationBaseOptions } from '@apollo/client/core/watchQueryOptions';

export interface CalendarEventFormData
  extends Pick<CalendarEvent, 'durationDays' | 'durationMinutes' | 'multipleDays' | 'startDate' | 'type' | 'wholeDay'> {
  displayName: Profile['displayName'];
  description: Profile['description'];
  references: Profile['references'];
  tags: string[];
}

export interface CalendarEventsContainerProps {
  spaceId: string;
  challengeId: string | undefined;
  opportunityId: string | undefined;
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

export const CalendarEventsContainer: FC<CalendarEventsContainerProps> = ({
  spaceId,
  challengeId,
  opportunityId,
  children,
}) => {
  const opportunityResults = useOpportunityCalendarEventsQuery({
    variables: { spaceId: spaceId!, opportunityId: opportunityId! },
    skip: !opportunityId || !spaceId,
  });

  const challengeResults = useChallengeCalendarEventsQuery({
    variables: { spaceId: spaceId!, challengeId: challengeId! },
    skip: !!opportunityId || !challengeId || !spaceId,
  });

  const spaceResults = useSpaceCalendarEventsQuery({
    variables: { spaceId: spaceId! },
    skip: !!opportunityId || !!challengeId || !spaceId,
  });

  const activeResults = opportunityId ? opportunityResults : challengeId ? challengeResults : spaceResults;
  const { loading } = activeResults;
  let collaboration;
  if (opportunityId) {
    collaboration = opportunityResults.data?.space.opportunity.collaboration;
  } else if (challengeId) {
    collaboration = challengeResults.data?.space.challenge?.collaboration;
  } else {
    collaboration = spaceResults.data?.space.collaboration;
  }

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

  const [deleteCalendarEvent, { loading: deletingCalendarEvent }] = useDeleteCalendarEventMutation();

  let refetchQueriesList: MutationBaseOptions['refetchQueries'] = [];

  if (opportunityId) {
    refetchQueriesList = [
      refetchOpportunityCalendarEventsQuery({ spaceId, opportunityId }),
      refetchOpportunityDashboardCalendarEventsQuery({ spaceId, opportunityId }),
    ];
  } else if (challengeId) {
    refetchQueriesList = [
      refetchChallengeCalendarEventsQuery({ spaceId, challengeId }),
      refetchChallengeDashboardCalendarEventsQuery({ spaceId, challengeId }),
    ];
  } else {
    refetchQueriesList = [
      refetchSpaceCalendarEventsQuery({ spaceId }),
      refetchSpaceDashboardCalendarEventsQuery({ spaceId }),
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
        refetchQueries: refetchQueriesList,
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
        refetchQueries: refetchQueriesList,
        awaitRefetchQueries: true,
      }).then(result => result.data?.deleteCalendarEvent?.nameID);
    },
    [deleteCalendarEvent, spaceId]
  );

  return (
    // TODO verify that StorageConfig must be fetched for the Space always
    <StorageConfigContextProvider journeyId={spaceId} locationType="journey" journeyTypeName="space">
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
