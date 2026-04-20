/**
 * Data-mapper contracts.
 *
 * `src/main/crdPages/space/dataMappers/calendarEventDataMapper.ts`
 *
 * The mappers are the boundary between GraphQL fragment shapes and CRD
 * presentational prop types. CRD components NEVER import GraphQL types; the
 * mapper is the only place where the two type systems meet.
 */

import type {
  CalendarEventDetailsFragment,
  CalendarEventInfoFragment,
  CalendarEventImportUrlsQuery,
} from '@/core/apollo/generated/graphql-schema';
import type {
  AddToCalendarLinks,
  EventDetailData,
  EventFormValues,
  EventListItem,
  SidebarEventItem,
} from './crd-presentational';

// -----------------------------------------------------------------------------
// Sidebar mapper
// -----------------------------------------------------------------------------

/**
 * Pass raw Date through (component formats locally for locale awareness).
 * `url` always populated from `event.profile.url`.
 */
export type MapCalendarEventInfoToSidebarItem = (
  event: CalendarEventInfoFragment
) => SidebarEventItem;

// -----------------------------------------------------------------------------
// List mapper
// -----------------------------------------------------------------------------

/**
 * `subspaceName` populated from `event.subspace?.about.profile.displayName` when
 * the includeSubspace flag was set on the query (i.e., we're viewing the
 * parent's calendar). Null otherwise.
 */
export type MapCalendarEventInfoToListItem = (
  event: CalendarEventInfoFragment
) => EventListItem;

// -----------------------------------------------------------------------------
// Detail mapper
// -----------------------------------------------------------------------------

export type MapCalendarEventDetailsToDetailData = (
  event: CalendarEventDetailsFragment | undefined,
  opts: { loading: boolean; notFound?: boolean }
) => EventDetailData;

// -----------------------------------------------------------------------------
// Edit-form prefill mapper
// -----------------------------------------------------------------------------

/**
 * Maps a CalendarEventDetails fragment to an EventFormValues snapshot for the
 * edit-mode prefill. Computes `endDate` from `startDate + durationMinutes` if
 * the underlying event is multi-day, otherwise leaves `endDate === startDate`
 * and exposes the duration in minutes.
 */
export type MapCalendarEventDetailsToFormValues = (
  event: CalendarEventDetailsFragment
) => EventFormValues;

// -----------------------------------------------------------------------------
// External-calendar URLs mapper
// -----------------------------------------------------------------------------

/** `event.profile.displayName` is used as the base for the ICS filename. */
export type MapCalendarEventImportUrlsToLinks = (
  data: CalendarEventImportUrlsQuery['lookup']['calendarEvent']
) => AddToCalendarLinks;

// -----------------------------------------------------------------------------
// Helper: pick top-N future events for the sidebar (used by useCrdCalendarSidebar)
// -----------------------------------------------------------------------------

export type SelectFutureEvents = (
  events: CalendarEventInfoFragment[],
  limit: number
) => CalendarEventInfoFragment[];
