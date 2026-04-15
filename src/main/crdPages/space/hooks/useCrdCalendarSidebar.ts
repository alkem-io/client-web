import dayjs from 'dayjs';
import { sortBy } from 'lodash-es';
import useCalendarEvents from '@/domain/timeline/calendar/useCalendarEvents';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { mapCalendarEventInfoToSidebarItem, type SidebarEventItem } from '../dataMappers/calendarEventDataMapper';

const SIDEBAR_EVENT_LIMIT = 3;

export type CrdCalendarSidebar = {
  /** Top N future events for the current space, ascending by start date. */
  events: SidebarEventItem[];
  /** Drives visibility of the sidebar `+` button. */
  canCreateEvents: boolean;
  /** Loading state — the sidebar may render skeleton rows while true. */
  loading: boolean;
};

/**
 * Sidebar-specific view of the calendar. Shares the underlying
 * `useSpaceCalendarEventsQuery` with CrdCalendarDialogConnector via Apollo's
 * normalised cache (no extra network request).
 */
export function useCrdCalendarSidebar(): CrdCalendarSidebar {
  const { spaceId, parentSpaceId } = useUrlResolver();
  // useCalendarEvents internally sets includeSubspace=!parentSpaceId, so at L0
  // we receive parent events PLUS subspace events flagged visibleOnParentCalendar
  // (FR-033/035). Apollo dedupes against the dialog connector's identical call.
  const { entities, state } = useCalendarEvents({ spaceId, parentSpaceId });

  const startOfToday = dayjs().startOf('day');
  const futureSorted = sortBy(
    entities.events.filter(event => event.startDate && dayjs(event.startDate).isAfter(startOfToday)),
    event => dayjs(event.startDate).valueOf()
  );

  return {
    events: futureSorted.slice(0, SIDEBAR_EVENT_LIMIT).map(mapCalendarEventInfoToSidebarItem),
    canCreateEvents: entities.privileges.canCreateEvents,
    loading: state.loading,
  };
}
