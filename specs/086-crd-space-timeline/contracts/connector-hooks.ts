/**
 * Connector contracts.
 *
 * These live in `src/main/crdPages/space/timeline/` and `hooks/`.
 * They MAY import from `@apollo/client`, `@/domain/*`, `@/core/apollo/*`,
 * `react-router-dom`, etc. They MUST NOT push GraphQL types into CRD
 * components — every call into a CRD component goes through a data-mapper.
 */

import type { ReactNode } from 'react';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import type {
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

/** `src/main/crdPages/space/timeline/useCrdEventForm.ts`
 *
 * `initialValues` seeds state once at mount via the lazy-init form of useState,
 * so subsequent renders do not stomp user edits. To reseed for a different
 * event, remount the consumer (e.g. pass a `key` prop tied to the event id) —
 * see useCrdEventFormDialog below for the orchestration pattern. */
export type UseCrdEventForm = (initialValues?: Partial<EventFormValues>) => {
  values: EventFormValues;
  errors: EventFormErrors;
  setField: <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => void;
  /** Returns true when the current values pass yup validation. Sets `errors`
   *  as a side effect for the form to render. */
  validate: () => boolean;
  /** Resets values to the defaults (NOT initialValues) and clears errors. */
  clearForm: () => void;
};

// -----------------------------------------------------------------------------
// Form-dialog orchestrator (owns create/edit/delete slice of the dialog)
// -----------------------------------------------------------------------------

/** `src/main/crdPages/space/timeline/useCrdEventFormDialog.ts`
 *
 * Composes useCrdEventForm + delete state + submit handlers into a single hook
 * the dialog wrapper consumes. The wrapper is mounted with
 * `key={editingEventId ?? 'create'}` so React remounts the hook per event id,
 * which seeds initialValues declaratively (no manual ref gating). */
export type UseCrdEventFormDialog = (params: {
  mode: 'create' | 'edit';
  /** Required when mode === 'edit'; ignored otherwise. */
  editingEventId: string | undefined;
  // The shape of `events` and `actions` mirrors useCalendarEvents' return; the
  // hook is generic over the domain types so the contract stays plain TS.
  events: ReadonlyArray<{ id: string; profile: { displayName: string; tagset?: unknown } }>;
  actions: {
    createEvent: (...args: unknown[]) => Promise<string | undefined>;
    updateEvent: (...args: unknown[]) => Promise<string | undefined>;
    deleteEvent: (eventId: string) => Promise<void>;
  };
  urlState: ReturnType<UseCrdCalendarUrlState>;
  parentSpaceId: string | undefined;
  isCreating: boolean;
  isUpdating: boolean;
  /** Called when the user cancels an edit OR a save/delete completes. */
  onExitEdit: () => void;
}) => {
  values: EventFormValues;
  errors: EventFormErrors;
  setField: <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => void;

  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;

  isDeleteOpen: boolean;
  openDelete: () => void;
  closeDelete: () => void;
  isDeleting: boolean;
  handleConfirmDelete: () => Promise<void>;

  isSubspace: boolean;
  editingEvent: { id: string; profile: { displayName: string } } | undefined;
  typeOptions: { value: string; label: string }[];
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
   * Wired into the EventDetailView's not-found back button AND the dialog
   * header's Back action so closing from either surface routes through one
   * path. The parent connector typically passes urlState.navigateToList here.
   */
  onBack: () => void;
};

// -----------------------------------------------------------------------------
// Comments connector (mirrors CalloutCommentsConnector pattern)
// -----------------------------------------------------------------------------

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
// Shared room-comments hook (extracted by T023a; consumed by CalloutCommentsConnector
// AND CalendarCommentsConnector to satisfy DRY)
// -----------------------------------------------------------------------------

/** `src/main/crdPages/space/hooks/useCrdRoomComments.ts` */
export type UseCrdRoomComments = (params: {
  roomId: string;
  /** Pre-loaded room object. Either fetched lazily by the consumer
   *  (CalloutCommentsConnector with useInView gating) or eagerly available
   *  (CalendarCommentsConnector — already loaded by useCalendarEventDetail). */
  room: CommentsWithMessagesModel | undefined;
  /** When true, do not subscribe to live room events. CalloutCommentsConnector
   *  forwards `!inView` here for lazy subscription; CalendarCommentsConnector
   *  omits to default to false (always subscribe). */
  skipSubscription?: boolean;
}) => {
  thread: ReactNode;
  commentInput: ReactNode | null;
  commentCount: number;
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
