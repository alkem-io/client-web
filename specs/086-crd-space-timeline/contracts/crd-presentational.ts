/**
 * CRD presentational component contracts for the Space Timeline feature.
 *
 * These are TYPE-LEVEL CONTRACTS only — they describe the props every CRD
 * presentational component MUST accept. Implementations live in
 * `src/crd/components/space/timeline/`. CRD purity rules apply: no imports
 * from `@mui/*`, `@apollo/client`, `@/domain/*`, `@/core/apollo/*`, `formik`,
 * or `react-router-dom` allowed in the implementations.
 *
 * This file is a documentation artifact, not a build-time module. The runtime
 * components re-declare these types in their own files (no barrel imports per
 * project convention).
 */

import type { ReactNode } from 'react';

// -----------------------------------------------------------------------------
// Shared data shapes (also defined in data-model.md)
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
  // No color — the EventDetailView resolves the avatar fallback colour from
  // author.id via the resolveColor callback prop.
  profileUrl?: string;
};

export type EventDetailData = {
  id: string;
  title: string;
  description: string;
  // Optional and not settable through the CRD form — only populated for
  // legacy events seeded by the old MUI dialog. When undefined the detail
  // view renders no banner area at all (no gradient, no placeholder).
  bannerUrl?: string;
  // Free-text city. The mapper coerces empty/whitespace-only values to
  // undefined so the detail view can omit the location row entirely
  // (FR-014). Rendered under the description with a MapPin icon.
  location?: string;
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

export type AddToCalendarLinks = {
  googleUrl: string;
  outlookUrl: string;
  icsUrl: string;
  icsFilename: string;
};

/**
 * Permission set for the calendar (returned by useCalendarEvents domain hook).
 * Drives button visibility throughout the dialog.
 */
export type EventListPermissions = {
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
};

// -----------------------------------------------------------------------------
// Sidebar widget (existing CRD component — props evolved by this feature)
// -----------------------------------------------------------------------------

/** `src/crd/components/space/sidebar/EventsSection.tsx` (MODIFIED) */
export type EventsSectionProps = {
  events: SidebarEventItem[];
  /** Visible when defined; omitted to hide. */
  onShowCalendar?: () => void;
  /** Visible only when defined; gated by canCreateEvents at the consumer. */
  onAddEvent?: () => void;
  /** Optional row click handler — when defined, each row becomes interactive. */
  onEventClick?: (event: SidebarEventItem) => void;
  className?: string;
};

// -----------------------------------------------------------------------------
// Top-level dialog shell
// -----------------------------------------------------------------------------

/** `src/crd/components/space/timeline/TimelineDialog.tsx` */
export type TimelineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Visible title in the header (e.g., "Events", "Add event", "Edit event"). */
  title: string;
  /** Optional secondary line below the title (e.g., the event title in detail view). */
  subtitle?: string;
  /** Header-right slot (e.g., AddToCalendarMenu, ExportEventsToIcs, Edit/Back actions). */
  headerActions?: ReactNode;
  /** Footer-right slot (e.g., Save / Delete / Back). */
  footerActions?: ReactNode;
  /** Body content — list view, detail view, or form view. */
  children: ReactNode;
  /** When true, the modal uses a wider max-width on tablet+. Defaults to false. */
  wide?: boolean;
};

// -----------------------------------------------------------------------------
// List view: calendar + event list
// -----------------------------------------------------------------------------

/** `src/crd/components/space/timeline/EventsCalendarView.tsx` */
export type EventsCalendarViewProps = {
  events: EventListItem[];
  /** When non-null, the calendar shows the day as selected and the list scrolls/highlights. */
  highlightedDay: Date | null;
  /** Fires when the user clicks a marked day on the calendar. */
  onHighlightDay: (date: Date) => void;
  /** Fires when the user clicks an event card. */
  onEventClick: (event: EventListItem) => void;
  /** True while events are loading; component shows skeleton list rows. */
  loading?: boolean;
  /** Optional empty-state text override (defaults to i18n `noUpcomingEvents`). */
  emptyMessage?: string;
  /** Slot rendered in the right-pane top bar (typically the ICS export button). */
  exportSlot?: ReactNode;
};

// -----------------------------------------------------------------------------
// Event card + sub-components
// -----------------------------------------------------------------------------

/** `src/crd/components/space/timeline/EventCard.tsx` */
export type EventCardProps = {
  event: EventListItem;
  highlighted?: boolean;
  onClick: () => void;
};

/** `src/crd/components/space/timeline/EventCardHeader.tsx` */
export type EventCardHeaderProps = {
  event: Pick<
    EventListItem,
    'title' | 'startDate' | 'durationMinutes' | 'durationDays' | 'wholeDay' | 'type' | 'subspaceName'
  >;
  loading?: boolean;
};

/** `src/crd/components/space/timeline/EventDateBadge.tsx` */
export type EventDateBadgeProps = {
  startDate: Date | undefined;
  durationMinutes: number;
  durationDays?: number;
  wholeDay?: boolean;
  /** "sm" for sidebar/list, "md" for detail header. */
  size?: 'sm' | 'md';
};

// -----------------------------------------------------------------------------
// Detail view
// -----------------------------------------------------------------------------

/** `src/crd/components/space/timeline/EventDetailView.tsx` */
export type EventDetailViewProps = {
  event: EventDetailData;
  /** Whether the comments column is shown at all. Driven by canReadComments. */
  showComments: boolean;
  commentCount?: number;
  /** Comments thread injected by the connector (CommentThread CRD composite). */
  commentsSlot?: ReactNode;
  /** Comment input injected by the connector. Null when canPostComments is false. */
  commentInputSlot?: ReactNode;
  /**
   * Required handler for the "not found" state's back button. Same callback the
   * consumer wires to the dialog header's Back action so closing from either
   * surface routes through one path.
   */
  onBack: () => void;
  /**
   * Pure helper that maps an entity id to a deterministic colour. Defined at a
   * high level (the EventDetailConnector imports pickColorFromId from
   * @/crd/lib/pickColorFromId) and passed down as a callback. Invoked lazily
   * only for the author-avatar fallback background when
   * `event.author.avatarUrl` is undefined. Events no longer use a gradient
   * fallback for missing banners, so the component does not call this helper
   * for the banner. Keeps the leaf component free of business helper imports.
   */
  resolveColor: (id: string) => string;
};

// -----------------------------------------------------------------------------
// Create/edit form
// -----------------------------------------------------------------------------

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

export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

export type EventTypeOption = { value: string; label: string };

/** `src/crd/components/space/timeline/EventForm.tsx` */
export type EventFormProps = {
  values: EventFormValues;
  errors: EventFormErrors;
  /** Single-key change channel; component never mutates state directly. */
  onChange: <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => void;
  /** Submit callback; presentational form does NOT validate — connector calls validate() before invoking onSubmit. */
  onSubmit: () => void;
  isSubmitting: boolean;
  /** Determines whether the visibleOnParentCalendar toggle is rendered (FR-024). */
  isSubspace: boolean;
  /** Localized type options injected by the connector (translation lives in connector). */
  typeOptions: EventTypeOption[];
  /** Optional left-of-Save footer actions (e.g., Back, Delete). */
  footerActionsLeft?: ReactNode;
};

// -----------------------------------------------------------------------------
// Add-to-calendar dropdown
// -----------------------------------------------------------------------------

/** `src/crd/components/space/timeline/AddToCalendarMenu.tsx` */
export type AddToCalendarMenuProps = {
  /** Undefined while loading; component shows a single disabled "Loading…" item. */
  links: AddToCalendarLinks | undefined;
  loading?: boolean;
  /** Localized aria-label for the icon-only trigger button. */
  triggerLabel: string;
  /** Connector-controlled open state to enable lazy loading on first open. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

// -----------------------------------------------------------------------------
// Delete confirmation
// -----------------------------------------------------------------------------

/** `src/crd/components/space/timeline/DeleteEventConfirmation.tsx` */
export type DeleteEventConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  /** Localized "Space" or "Subspace" string from the connector. */
  entityLabel: string;
  onConfirm: () => void;
  loading?: boolean;
};
