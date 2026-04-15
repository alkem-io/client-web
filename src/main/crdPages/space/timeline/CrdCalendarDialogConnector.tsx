import { isSameDay } from 'date-fns';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarEventType } from '@/core/apollo/generated/graphql-schema';
import { DeleteEventConfirmation } from '@/crd/components/space/timeline/DeleteEventConfirmation';
import { EventForm } from '@/crd/components/space/timeline/EventForm';
import { EventsCalendarView } from '@/crd/components/space/timeline/EventsCalendarView';
import { TimelineDialog } from '@/crd/components/space/timeline/TimelineDialog';
import { Button } from '@/crd/primitives/button';
import type { CalendarEventFormData } from '@/domain/timeline/calendar/useCalendarEvents';
import useCalendarEvents from '@/domain/timeline/calendar/useCalendarEvents';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { mapCalendarEventInfoToListItem } from '../dataMappers/calendarEventDataMapper';
import { AddToCalendarMenuConnector } from './AddToCalendarMenuConnector';
import { EventDetailConnector } from './EventDetailConnector';
import { ExportEventsToIcsConnector } from './ExportEventsToIcsConnector';
import { useCrdCalendarUrlState } from './useCrdCalendarUrlState';
import { useCrdEventForm } from './useCrdEventForm';

type CrdCalendarDialogConnectorProps = {
  /** Owned by the page; mirrors the dialog's open state. The connector also
   *  reads URL state (calendarEventId, ?new=1) and force-opens accordingly. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Mirrors the existing MUI temporaryLocation flag for subspace flows.
   *  Currently unused at the connector level but kept for parity. */
  temporaryLocation?: boolean;
};

type View = 'list' | 'detail' | 'create' | 'edit';

/**
 * Top-level state machine for the calendar dialog. Mirrors the MUI
 * CalendarDialogInner pattern: derives `view` from URL state + local state and
 * renders the appropriate body inside <TimelineDialog>.
 *
 * SKELETON (T009): all view bodies are placeholders. US1 wires the sidebar to
 * open this dialog; US2 fills the list view; US3 fills the detail view; US4
 * fills create/edit; US5 fills delete; US6 fills external-calendar export.
 */
export function CrdCalendarDialogConnector({ open, onOpenChange }: CrdCalendarDialogConnectorProps) {
  const { t } = useTranslation('crd-space');
  const { spaceId, parentSpaceId, calendarEventId } = useUrlResolver();
  const urlState = useCrdCalendarUrlState();

  // useCalendarEvents internally sets includeSubspace=!parentSpaceId, so at L0
  // we receive parent events PLUS subspace events with visibleOnParentCalendar=true
  // (FR-033/035); inside a subspace we get that subspace's own events only.
  const { entities, actions, state } = useCalendarEvents({ spaceId, parentSpaceId });
  const { events, privileges } = entities;
  const { loading, creatingCalendarEvent, updatingCalendarEvent } = state;

  const listItems = events.map(mapCalendarEventInfoToListItem);

  // Future events only — drives the batch ICS export button visibility and
  // payload (FR-032).
  const startOfToday = dayjs().startOf('day');
  const futureListItems = listItems.filter(item => item.startDate && dayjs(item.startDate).isAfter(startOfToday));

  const [editingEventId, setEditingEventId] = useState<string | undefined>(undefined);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [isDeletingInFlight, setIsDeletingInFlight] = useState<boolean>(false);

  const form = useCrdEventForm();
  /** Tracks the last event we prefilled from, so flipping between create/edit
   *  doesn't repeatedly reset the form mid-typing. */
  const prefilledEventIdRef = useRef<string | undefined>(undefined);

  const isSubspace = Boolean(parentSpaceId);
  const typeOptions = Object.values(CalendarEventType).map(value => ({
    value,
    label: t(`calendar.type.${value}`),
  }));

  // Prefill the form when entering edit mode with a new event.
  useEffect(() => {
    if (editingEventId && editingEventId !== prefilledEventIdRef.current) {
      const event = events.find(e => e.id === editingEventId);
      if (event) {
        const startDate = event.startDate ? new Date(event.startDate) : undefined;
        const endDate = startDate ? new Date(startDate.getTime() + event.durationMinutes * 60_000) : undefined;
        form.prefill({
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
        });
        prefilledEventIdRef.current = editingEventId;
      }
    } else if (!editingEventId && prefilledEventIdRef.current) {
      // Exited edit mode — reset for the next create/edit cycle.
      form.reset();
      prefilledEventIdRef.current = undefined;
    }
  }, [editingEventId, events, form]);

  /** Convert CRD EventFormValues to domain CalendarEventFormData, computing
   *  durationMinutes/durationDays/multipleDays the same way as MUI
   *  useCalendarEvents.createEvent (lines 103-115). */
  const toDomainPayload = (): CalendarEventFormData | undefined => {
    const {
      displayName,
      type,
      startDate,
      endDate,
      wholeDay,
      description,
      locationCity,
      tags,
      visibleOnParentCalendar,
    } = form.values;
    if (!startDate || !endDate || !type) return undefined;

    let durationMinutes = form.values.durationMinutes ?? 0;
    let durationDays = 0;
    let multipleDays = false;

    if (!isSameDay(startDate, endDate)) {
      durationMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / 60_000);
      durationDays = Math.floor(durationMinutes / (24 * 60));
      multipleDays = durationDays > 0;
    }

    return {
      displayName,
      description,
      type: type as CalendarEventType,
      startDate,
      endDate,
      wholeDay,
      durationMinutes,
      durationDays,
      multipleDays,
      visibleOnParentCalendar,
      tags,
      references: [],
      location: { id: '', city: locationCity },
    };
  };

  const handleCreateSubmit = async () => {
    if (!form.validate()) return;
    const payload = toDomainPayload();
    if (!payload) return;
    const eventUrl = await actions.createEvent(payload);
    form.reset();
    if (eventUrl) {
      urlState.navigateToEvent(eventUrl);
    } else {
      urlState.navigateToList();
    }
  };

  const handleEditSubmit = async () => {
    if (!form.validate() || !editingEventId) return;
    const payload = toDomainPayload();
    if (!payload) return;

    const event = events.find(e => e.id === editingEventId);
    if (!event?.profile.tagset) return;

    await actions.updateEvent(editingEventId, payload, event.profile.tagset);
    setEditingEventId(undefined);
    prefilledEventIdRef.current = undefined;
    // Return to detail view — navigateToEvent uses the existing event URL.
    urlState.navigateToEvent(event.profile.url);
  };

  const handleCancelForm = () => {
    if (editingEventId) {
      setEditingEventId(undefined);
    } else {
      // Cancel create — clear ?new=1 and return to list.
      urlState.navigateToList();
    }
    form.reset();
  };

  const handleConfirmDelete = async () => {
    if (!editingEventId) return;
    setIsDeletingInFlight(true);
    try {
      await actions.deleteEvent(editingEventId);
      // Reset all dialog state after a successful delete (FR-029).
      setEditingEventId(undefined);
      setDeleting(false);
      prefilledEventIdRef.current = undefined;
      form.reset();
      urlState.navigateToList();
    } finally {
      setIsDeletingInFlight(false);
    }
  };

  // Snapshot of the event being edited (used for the delete confirmation copy
  // and to look up the tagset for an update). Computed every render — bounded
  // by the existing event list size.
  const editingEvent = editingEventId ? events.find(e => e.id === editingEventId) : undefined;

  /** Force-open the dialog when the URL is anywhere in the calendar tree
   *  (deep links). The page's local "open" state is the user-driven channel. */
  useEffect(() => {
    if (urlState.isAnyCalendarRoute && !open) {
      onOpenChange(true);
    }
  }, [urlState.isAnyCalendarRoute, open, onOpenChange]);

  const view: View = (() => {
    // Edit takes precedence over the URL-driven create/detail views; the
    // delete confirmation is an overlay on top of edit (handled below by
    // <DeleteEventConfirmation>), not a separate view.
    if (editingEventId) return 'edit';
    if (urlState.isCreatingFromUrl) return 'create';
    if (calendarEventId) return 'detail';
    return 'list';
  })();

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      // Clear local state; clear URL params/path so reopening is bookmark-fresh.
      setEditingEventId(undefined);
      setDeleting(false);
      urlState.navigateAwayFromCalendar();
    }
  };

  const title = (() => {
    switch (view) {
      case 'create':
        return t('calendar.addEvent');
      case 'edit':
        return t('calendar.editEvent');
      default:
        // List and detail share the generic "Events" title — the body makes
        // the specific event visible via EventCardHeader / list layout.
        return t('calendar.title');
    }
  })();

  const headerActions = (() => {
    if (view === 'detail' && calendarEventId) {
      return (
        <>
          <AddToCalendarMenuConnector eventId={calendarEventId} />
          {privileges.canEditEvents && (
            <Button variant="outline" size="sm" onClick={() => setEditingEventId(calendarEventId)}>
              {t('calendar.edit')}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={urlState.navigateToList}>
            {t('calendar.back')}
          </Button>
        </>
      );
    }
    return null;
  })();

  return (
    <TimelineDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      headerActions={headerActions}
      wide={view === 'list' || view === 'detail'}
    >
      {view === 'list' && (
        <EventsCalendarView
          events={listItems}
          highlightedDay={urlState.highlightedDay}
          onHighlightDay={urlState.navigateToHighlight}
          onEventClick={event => urlState.navigateToEvent(event.url)}
          loading={loading}
          exportSlot={<ExportEventsToIcsConnector events={futureListItems} />}
        />
      )}
      {view === 'detail' && calendarEventId && (
        <EventDetailConnector eventId={calendarEventId} onBack={urlState.navigateToList} />
      )}
      {view === 'create' && (
        <EventForm
          values={form.values}
          errors={form.errors}
          onChange={form.setField}
          onSubmit={handleCreateSubmit}
          isSubmitting={creatingCalendarEvent}
          isSubspace={isSubspace}
          typeOptions={typeOptions}
          footerActionsLeft={
            <Button variant="ghost" onClick={handleCancelForm} type="button">
              {t('calendar.cancel')}
            </Button>
          }
        />
      )}
      {view === 'edit' && (
        <EventForm
          values={form.values}
          errors={form.errors}
          onChange={form.setField}
          onSubmit={handleEditSubmit}
          isSubmitting={updatingCalendarEvent}
          isSubspace={isSubspace}
          typeOptions={typeOptions}
          footerActionsLeft={
            <>
              {privileges.canDeleteEvents && editingEventId && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleting(true)}
                  disabled={updatingCalendarEvent || isDeletingInFlight}
                >
                  {t('calendar.deleteConfirm.title')}
                </Button>
              )}
              <Button variant="ghost" onClick={handleCancelForm} type="button">
                {t('calendar.back')}
              </Button>
            </>
          }
        />
      )}
      <DeleteEventConfirmation
        open={deleting}
        onOpenChange={next => {
          if (!isDeletingInFlight) setDeleting(next);
        }}
        eventTitle={editingEvent?.profile.displayName ?? ''}
        entityLabel={t(isSubspace ? 'calendar.entity.subspace' : 'calendar.entity.space')}
        onConfirm={handleConfirmDelete}
        loading={isDeletingInFlight}
      />
    </TimelineDialog>
  );
}
