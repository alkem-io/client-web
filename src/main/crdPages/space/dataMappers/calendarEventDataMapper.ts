/**
 * Calendar event data mappers.
 *
 * Boundary between GraphQL fragment shapes (CalendarEventInfoFragment,
 * CalendarEventDetailsFragment, CalendarEventImportUrlsQuery) and the CRD
 * presentational prop types (SidebarEventItem, EventListItem, EventDetailData,
 * EventFormValues, AddToCalendarLinks).
 *
 * CRD components NEVER import GraphQL types — these mappers are the only place
 * where the two type systems meet. They also normalise dates from the API
 * (parsed as JS Date) so CRD components can format them in the viewer's local
 * time zone via date-fns.
 *
 * See /specs/086-crd-space-timeline/data-model.md and contracts/data-mappers.ts
 * for the full type contracts.
 */

import type {
  CalendarEventDetailsFragment,
  CalendarEventImportUrlsQuery,
  CalendarEventInfoFragment,
} from '@/core/apollo/generated/graphql-schema';

// -----------------------------------------------------------------------------
// CRD prop types (re-declared here per project convention — no barrel imports
// from the contracts/ folder; that folder is a spec artifact, not a runtime
// source. Keep these in sync with contracts/crd-presentational.ts.)
// -----------------------------------------------------------------------------

export type SidebarEventItem = {
  id: string;
  title: string;
  startDate: Date | undefined;
  url?: string;
};

export type EventListItem = {
  id: string;
  title: string;
  description?: string;
  startDate: Date | undefined;
  durationMinutes: number;
  durationDays?: number;
  wholeDay: boolean;
  type?: string;
  url: string;
  subspaceName?: string;
};

export type EventReference = {
  id: string;
  name: string;
  uri: string;
  description?: string;
};

export type EventAuthor = {
  id: string;
  name: string;
  avatarUrl?: string;
  profileUrl?: string;
};

export type EventDetailData = {
  id: string;
  title: string;
  description: string;
  bannerUrl?: string;
  tags: string[];
  references: EventReference[];
  startDate: Date | undefined;
  durationMinutes: number;
  durationDays?: number;
  wholeDay: boolean;
  type?: string;
  subspaceName?: string;
  author: EventAuthor;
  createdDate: Date | undefined;
  loading: boolean;
  notFound: boolean;
};

export type EventFormValues = {
  displayName: string;
  type: string | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  wholeDay: boolean;
  durationMinutes: number | undefined;
  description: string;
  locationCity: string;
  tags: string[];
  visibleOnParentCalendar: boolean;
};

export type AddToCalendarLinks = {
  googleUrl: string;
  outlookUrl: string;
  icsUrl: string;
  icsFilename: string;
};

// -----------------------------------------------------------------------------
// Mappers — bodies filled by US1 (T011), US2 (T015), US3 (T021), US4 (T029),
// US6 (T035). This T005 task scaffolds the module + types only.
// -----------------------------------------------------------------------------

export function mapCalendarEventInfoToSidebarItem(event: CalendarEventInfoFragment): SidebarEventItem {
  return {
    id: event.id,
    title: event.profile.displayName,
    startDate: event.startDate ? new Date(event.startDate) : undefined,
    url: event.profile.url,
  };
}

export function mapCalendarEventInfoToListItem(event: CalendarEventInfoFragment): EventListItem {
  return {
    id: event.id,
    title: event.profile.displayName,
    description: event.profile.description,
    startDate: event.startDate ? new Date(event.startDate) : undefined,
    durationMinutes: event.durationMinutes,
    durationDays: event.durationDays,
    wholeDay: event.wholeDay,
    type: event.type,
    url: event.profile.url,
    subspaceName: event.subspace?.about.profile.displayName,
  };
}

export function mapCalendarEventDetailsToDetailData(
  event: CalendarEventDetailsFragment | undefined,
  opts: { loading: boolean; notFound?: boolean }
): EventDetailData {
  const notFound = opts.notFound ?? false;

  if (!event) {
    // Loading or not-found stub. The event id flows through from the URL
    // resolver, not from this mapper — the component handles the placeholder.
    return {
      id: '',
      title: '',
      description: '',
      bannerUrl: undefined,
      tags: [],
      references: [],
      startDate: undefined,
      durationMinutes: 0,
      durationDays: undefined,
      wholeDay: false,
      type: undefined,
      subspaceName: undefined,
      author: { id: '', name: '' },
      createdDate: undefined,
      loading: opts.loading,
      notFound,
    };
  }

  const authorProfile = event.createdBy?.profile;

  return {
    id: event.id,
    title: event.profile.displayName,
    description: event.profile.description ?? '',
    // The EventProfile fragment does not expose a banner field (matches the
    // legacy MUI behaviour: banner was always undefined there too). The
    // component's gradient fallback handles this by design.
    bannerUrl: undefined,
    tags: event.profile.tagset?.tags ?? [],
    references: (event.profile.references ?? []).map(ref => ({
      id: ref.id,
      name: ref.name,
      uri: ref.uri,
      description: ref.description,
    })),
    startDate: event.startDate ? new Date(event.startDate) : undefined,
    durationMinutes: event.durationMinutes,
    durationDays: event.durationDays,
    wholeDay: event.wholeDay,
    type: event.type,
    subspaceName: event.subspace?.about.profile.displayName,
    author: {
      id: event.createdBy?.id ?? '',
      name: authorProfile?.displayName ?? '',
      avatarUrl: authorProfile?.visual?.uri,
      profileUrl: authorProfile?.url,
    },
    createdDate: event.createdDate ? new Date(event.createdDate) : undefined,
    loading: opts.loading,
    notFound: false,
  };
}

export function mapCalendarEventDetailsToFormValues(event: CalendarEventDetailsFragment): EventFormValues {
  const startDate = event.startDate ? new Date(event.startDate) : undefined;

  // Compute endDate from startDate + durationMinutes when non-zero; otherwise
  // fall back to startDate (same-day form UI uses the duration input).
  const endDate = (() => {
    if (!startDate) return undefined;
    if (event.durationMinutes > 0) {
      return new Date(startDate.getTime() + event.durationMinutes * 60_000);
    }
    return startDate;
  })();

  return {
    displayName: event.profile.displayName,
    type: event.type,
    startDate,
    endDate,
    wholeDay: event.wholeDay,
    durationMinutes: event.durationMinutes,
    description: event.profile.description ?? '',
    locationCity: event.profile.location?.city ?? '',
    tags: event.profile.tagset?.tags ?? [],
    visibleOnParentCalendar: event.visibleOnParentCalendar,
  };
}

export function mapCalendarEventImportUrlsToLinks(
  data: NonNullable<CalendarEventImportUrlsQuery['lookup']['calendarEvent']>
): AddToCalendarLinks {
  const safeFilename = `${data.profile.displayName.replace(/[^\w.-]+/g, '_') || 'event'}.ics`;
  // The schema marks each URL as optional even though the resolver always
  // returns one. Coerce to '' so the consumer can still render disabled-link
  // states uniformly without per-field undefined checks.
  return {
    googleUrl: data.googleCalendarUrl ?? '',
    outlookUrl: data.outlookCalendarUrl ?? '',
    icsUrl: data.icsDownloadUrl ?? '',
    icsFilename: safeFilename,
  };
}
