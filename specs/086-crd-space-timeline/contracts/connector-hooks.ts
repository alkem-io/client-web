/**
 * Connector contracts.
 *
 * These live in `src/main/crdPages/space/timeline/` and `hooks/`.
 * They MAY import from `@apollo/client`, `@/domain/*`, `@/core/apollo/*`,
 * `react-router-dom`, etc. They MUST NOT push GraphQL types into CRD
 * components — every call into a CRD component goes through a data-mapper.
 */

import type { ReactNode } from 'react';
import type {
  AddToCalendarLinks,
  EventDetailData,
  EventFormErrors,
  EventFormValues,
  EventListItem,
  EventListPermissions,
  SidebarEventItem,
} from './crd-presentational';

// -----------------------------------------------------------------------------
// Top-level dialog connector
// -----------------------------------------------------------------------------

/** `src/main/crdPages/space/timeline/CrdCalendarDialogConnector.tsx` */
export type CrdCalendarDialogConnectorProps = {
  /** Owned by the page; mirrors the dialog's open state. The connector also
   *  reads URL state (calendarEventId, ?new=1) and may force-open accordingly. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Mirrors the existing MUI temporaryLocation flag for subspace flows. */
  temporaryLocation?: boolean;
};

// -----------------------------------------------------------------------------
// URL state hook
// -----------------------------------------------------------------------------

/** `src/main/crdPages/space/timeline/useCrdCalendarUrlState.ts` */
export type UseCrdCalendarUrlState = () => {
  /** Parsed `?highlight=YYYY-MM-DD` value, null if absent or invalid. */
  highlightedDay: Date | null;
  /** True when `?new=1` is present. */
  isCreatingFromUrl: boolean;
  /** True when the URL is anywhere in the calendar tree (path includes /calendar). */
  isAnyCalendarRoute: boolean;

  /** Push `?highlight=` and keep current path. */
  navigateToHighlight: (date: Date) => void;
  /** Push `?new=1` and ensure path is `/calendar`. */
  navigateToCreate: () => void;
  /** Strip params and event id; navigate to the bare `/calendar`. */
  navigateToList: () => void;
  /** Navigate to a specific event detail URL (`event.profile.url`). */
  navigateToEvent: (eventUrl: string) => void;
  /** Strip the entire calendar tail from the URL (path + params). Used on close. */
  navigateAwayFromCalendar: () => void;
};

// -----------------------------------------------------------------------------
// Form hook (controlled, useState + standalone yup)
// -----------------------------------------------------------------------------

/** `src/main/crdPages/space/timeline/useCrdEventForm.ts` */
export type UseCrdEventForm = (initialValues?: Partial<EventFormValues>) => {
  values: EventFormValues;
  errors: EventFormErrors;
  setField: <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => void;
  /** Returns true when the current values pass yup validation. Sets `errors`
   *  as a side effect for the form to render. */
  validate: () => boolean;
  reset: () => void;
  /** Repopulate from a CalendarEventDetailsFragment (mapped to EventFormValues by the connector). */
  prefill: (data: Partial<EventFormValues>) => void;
};

// -----------------------------------------------------------------------------
// Sidebar hook
// -----------------------------------------------------------------------------

/** `src/main/crdPages/space/hooks/useCrdCalendarSidebar.ts` */
export type UseCrdCalendarSidebar = () => {
  /** Top 3 future events for the current space (sorted ascending). */
  events: SidebarEventItem[];
  /** Drives visibility of the sidebar `+` button. */
  canCreateEvents: boolean;
  /** Loading state — drives optional skeleton rendering in the sidebar. */
  loading: boolean;
};

// -----------------------------------------------------------------------------
// Detail connector (renders EventDetailView with comments slots wired up)
// -----------------------------------------------------------------------------

/** `src/main/crdPages/space/timeline/EventDetailConnector.tsx` */
export type EventDetailConnectorProps = {
  eventId: string;
  /**
   * Wired into the EventDetailView's not-found back button AND optionally
   * re-exposed through the slots render-prop for the consumer's header Back
   * action. The parent connector typically passes navigateToList here.
   */
  onBack: () => void;
  /**
   * Optional render override — when provided, the connector calls back with the
   * built `event`/`commentsSlot`/`commentInputSlot` so the parent can wrap them
   * in a custom layout. When omitted, the connector renders <EventDetailView />
   * directly.
   */
  children?: (slots: {
    event: EventDetailData;
    showComments: boolean;
    commentCount: number;
    commentsSlot: ReactNode;
    commentInputSlot: ReactNode | null;
  }) => ReactNode;
};

// -----------------------------------------------------------------------------
// Comments connector (mirrors CalloutCommentsConnector pattern)
// -----------------------------------------------------------------------------

import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';

/** `src/main/crdPages/space/timeline/CalendarCommentsConnector.tsx` */
export type CalendarCommentsConnectorProps = {
  roomId: string;
  /** Pre-loaded room data from useCalendarEventDetail. */
  room: CommentsWithMessagesModel | undefined;
  children: (slots: {
    thread: ReactNode;
    commentInput: ReactNode | null;
    commentCount: number;
  }) => ReactNode;
};

// -----------------------------------------------------------------------------
// Add-to-calendar connector (lazy URL fetch on dropdown open)
// -----------------------------------------------------------------------------

/** `src/main/crdPages/space/timeline/AddToCalendarMenuConnector.tsx` */
export type AddToCalendarMenuConnectorProps = {
  eventId: string;
  /** Localized aria-label override; defaults to t('crd-space.calendar.addToCalendar.trigger'). */
  triggerLabel?: string;
};

// -----------------------------------------------------------------------------
// Export-events-to-ICS connector
// -----------------------------------------------------------------------------

/** `src/main/crdPages/space/timeline/ExportEventsToIcsConnector.tsx` */
export type ExportEventsToIcsConnectorProps = {
  /** Future events only. The connector validates this; pass the same list it would receive. */
  events: EventListItem[];
};

// -----------------------------------------------------------------------------
// Permission shape returned by useCalendarEvents (already exists in domain layer;
// re-stated here for documentation completeness).
// -----------------------------------------------------------------------------

export type _CalendarPermissions = EventListPermissions; // alias for clarity
