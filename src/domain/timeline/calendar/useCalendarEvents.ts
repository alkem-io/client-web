import type { MutationBaseOptions } from '@apollo/client/core/watchQueryOptions';
import {
  refetchCalendarEventImportUrlsQuery,
  refetchSpaceCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useSpaceCalendarEventsQuery,
  useUpdateCalendarEventMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type CalendarEvent,
  type CalendarEventInfoFragment,
} from '@/core/apollo/generated/graphql-schema';
import { isSameDay } from '@/core/utils/time/utils';
import { toWholeDayWire } from '@/core/utils/time/wholeDayDate';
import type { LocationModel } from '@/domain/common/location/LocationModel';
import {
  mapProfileModelToCreateProfileInput,
  mapProfileModelToUpdateProfileInput,
} from '@/domain/common/profile/ProfileModelUtils';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import type { TagsetModel } from '@/domain/common/tagset/TagsetModel';

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

/**
 * Finalizes the calendar-event wire fields at the single mutation boundary, so
 * every caller of create/updateEvent is consistent regardless of how the payload
 * was built:
 *   - whole-day start/end are anchored to UTC-midnight (bare, timezone-independent
 *     calendar dates); timed events keep their real instant;
 *   - a **whole-day** event's span is defined purely by its date range, so
 *     `durationMinutes` is ALWAYS derived from the (anchored) start/end — a stale
 *     sub-day duration from before "whole day" was toggled never survives, and a
 *     single-day whole-day event is zero-length;
 *   - a **timed** event's `durationMinutes` is the full span, recomputed from
 *     start/end when they differ and kept as the user's value when they are the
 *     same day (that is its sub-day duration).
 */
export function deriveEventWireFields(input: {
  startDate: Date | number | null | undefined;
  endDate: Date | number | null | undefined;
  wholeDay: boolean;
  durationMinutes: number;
}): { startDate: Date; durationMinutes: number; durationDays: number; multipleDays: boolean } {
  const rawStart = input.startDate != null ? new Date(input.startDate) : new Date();
  const rawEnd = input.endDate != null ? new Date(input.endDate) : new Date();
  const startDate = input.wholeDay ? toWholeDayWire(rawStart) : rawStart;
  const endDate = input.wholeDay ? toWholeDayWire(rawEnd) : rawEnd;

  let durationMinutes = input.durationMinutes ?? 0;
  let durationDays = 0;
  let multipleDays = false;
  if (input.wholeDay) {
    // A whole-day event's span is its date range, so durationMinutes is the offset
    // between the two date pickers (End date − Start date) — NOT the event's length.
    // A single-day whole-day event (End date === Start date) is therefore 0, and
    // that is a correct, genuine all-day day: the ICS/Google/Outlook export appends
    // the RFC 5545 exclusive +1 day, so 0 covers exactly one day (1440 would cover
    // two). Any carried-over sub-day duration is discarded.
    durationMinutes = Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
    durationDays = Math.floor(durationMinutes / (24 * 60));
    multipleDays = durationDays > 0;
  } else if (!isSameDay(startDate, endDate)) {
    durationMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / 60000);
    durationDays = Math.floor(durationMinutes / (24 * 60));
    multipleDays = durationDays > 0;
  }
  return { startDate, durationMinutes, durationDays, multipleDays };
}

export interface CalendarEventsActions {
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

type UseCalendarEventsParams = {
  spaceId: string | undefined;
  parentSpaceId: string | undefined;
};

type UseCalendarEventsResult = {
  entities: CalendarEventsEntities;
  actions: CalendarEventsActions;
  state: CalendarEventsState;
};

const useCalendarEvents = ({ spaceId, parentSpaceId }: UseCalendarEventsParams): UseCalendarEventsResult => {
  const { data: spaceData, loading } = useSpaceCalendarEventsQuery({
    variables: { spaceId: spaceId ?? '', includeSubspace: !parentSpaceId },
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

  const refetchQueriesList: MutationBaseOptions['refetchQueries'] = (() => {
    const list = [refetchSpaceCalendarEventsQuery({ spaceId: spaceId ?? '' })];
    if (parentSpaceId) {
      list.push(refetchSpaceCalendarEventsQuery({ spaceId: parentSpaceId }));
    }
    return list;
  })();

  const createEvent = (event: CalendarEventFormData) => {
    if (!calendarId) {
      return Promise.reject(new Error('Calendar is not loaded yet'));
    }

    const { startDate, description, tags, references, displayName, endDate, location, wholeDay, ...rest } = event;
    const wire = deriveEventWireFields({ startDate, endDate, wholeDay, durationMinutes: rest.durationMinutes });

    return createCalendarEvent({
      variables: {
        eventData: {
          calendarID: calendarId,
          tags: tags,
          ...rest,
          startDate: wire.startDate,
          durationMinutes: wire.durationMinutes,
          durationDays: wire.durationDays,
          multipleDays: wire.multipleDays,
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
  };

  const updateEvent = (eventId: string, event: CalendarEventFormData, tagset: TagsetModel) => {
    const { startDate, description, tags, references, displayName, endDate, location, wholeDay, ...rest } = event;
    const wire = deriveEventWireFields({ startDate, endDate, wholeDay, durationMinutes: rest.durationMinutes });

    const updatedTagset = { ...tagset };
    updatedTagset.tags = [...tags];

    return updateCalendarEvent({
      variables: {
        eventData: {
          ID: eventId,
          startDate: wire.startDate,
          ...rest,
          durationMinutes: wire.durationMinutes,
          durationDays: wire.durationDays,
          multipleDays: wire.multipleDays,
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
      refetchQueries: [...refetchQueriesList, refetchCalendarEventImportUrlsQuery({ eventId })],
      awaitRefetchQueries: true,
    }).then(result => result.data?.updateCalendarEvent?.profile.url);
  };

  const deleteEvent = async (eventId: string) => {
    await deleteCalendarEvent({
      variables: {
        deleteData: {
          ID: eventId,
        },
      },
      refetchQueries: refetchQueriesList,
      awaitRefetchQueries: true,
    });
  };

  return {
    entities: { events, privileges },
    actions: { createEvent, updateEvent, deleteEvent },
    state: { loading, creatingCalendarEvent, updatingCalendarEvent },
  };
};

export default useCalendarEvents;
