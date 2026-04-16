import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteEventConfirmation } from '@/crd/components/space/timeline/DeleteEventConfirmation';
import { EventForm } from '@/crd/components/space/timeline/EventForm';
import { EventsCalendarView } from '@/crd/components/space/timeline/EventsCalendarView';
import { TimelineDialog } from '@/crd/components/space/timeline/TimelineDialog';
import { Button } from '@/crd/primitives/button';
import useCalendarEvents from '@/domain/timeline/calendar/useCalendarEvents';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { mapCalendarEventInfoToListItem } from '../dataMappers/calendarEventDataMapper';
import { AddToCalendarMenuConnector } from './AddToCalendarMenuConnector';
import { EventDetailConnector } from './EventDetailConnector';
import { ExportEventsToIcsConnector } from './ExportEventsToIcsConnector';
import { useCrdCalendarUrlState } from './useCrdCalendarUrlState';
import { useCrdEventFormDialog } from './useCrdEventFormDialog';

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
 * Top-level orchestrator for the calendar dialog. Composes:
 *   - useUrlResolver — spaceId / parentSpaceId / calendarEventId from the URL
 *   - useCalendarEvents — events + privileges + create/update/delete actions
 *   - useCrdCalendarUrlState — URL deeplink reads/writes
 *   - local editingEventId state — drives the create vs edit path
 *
 * The create/edit/delete slice (form state, submit/delete handlers, payload
 * normalisation) lives in useCrdEventFormDialog and is hosted by the
 * <EventFormDialogBody> sub-component below. That sub-component is mounted
 * with `key={editingEventId ?? 'create'}` so React remounts a fresh instance
 * per event id — eliminating any need for manual refs to gate prefill.
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

  /** Force-open the dialog when the URL is anywhere in the calendar tree
   *  (deep links). The page's local "open" state is the user-driven channel. */
  useEffect(() => {
    if (urlState.isAnyCalendarRoute && !open) {
      onOpenChange(true);
    }
  }, [urlState.isAnyCalendarRoute, open, onOpenChange]);

  const view: View = (() => {
    // Edit takes precedence over the URL-driven create/detail views; the
    // delete confirmation is an overlay on top of edit (handled inside
    // <EventFormDialogBody>), not a separate view.
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

  const showFormBody = view === 'create' || view === 'edit';

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
      {showFormBody && (
        <EventFormDialogBody
          // Remount per event id so the form state is freshly seeded from the
          // right initialValues without manual ref gating.
          key={editingEventId ?? 'create'}
          mode={view === 'edit' ? 'edit' : 'create'}
          editingEventId={editingEventId}
          events={events}
          actions={actions}
          urlState={urlState}
          parentSpaceId={parentSpaceId}
          isCreating={creatingCalendarEvent}
          isUpdating={updatingCalendarEvent}
          canDeleteEvents={privileges.canDeleteEvents}
          onExitEdit={() => setEditingEventId(undefined)}
        />
      )}
    </TimelineDialog>
  );
}

// -----------------------------------------------------------------------------
// EventFormDialogBody — co-located sub-component. Hosts useCrdEventFormDialog
// so the parent can remount it via `key` to reseed form state per event.
// -----------------------------------------------------------------------------

type EventFormDialogBodyProps = Omit<Parameters<typeof useCrdEventFormDialog>[0], 'isCreating' | 'isUpdating'> & {
  isCreating: boolean;
  isUpdating: boolean;
  canDeleteEvents: boolean;
};

function EventFormDialogBody({
  mode,
  editingEventId,
  events,
  actions,
  urlState,
  parentSpaceId,
  isCreating,
  isUpdating,
  canDeleteEvents,
  onExitEdit,
}: EventFormDialogBodyProps) {
  const { t } = useTranslation('crd-space');
  const dialog = useCrdEventFormDialog({
    mode,
    editingEventId,
    events,
    actions,
    urlState,
    parentSpaceId,
    isCreating,
    isUpdating,
    onExitEdit,
  });

  const cancelLabel = mode === 'edit' ? t('calendar.back') : t('calendar.cancel');

  return (
    <>
      <EventForm
        values={dialog.values}
        errors={dialog.errors}
        onChange={dialog.setField}
        onSubmit={dialog.handleSubmit}
        isSubmitting={dialog.isSubmitting}
        isSubspace={dialog.isSubspace}
        typeOptions={dialog.typeOptions}
        footerActionsLeft={
          <>
            {mode === 'edit' && canDeleteEvents && (
              <Button
                type="button"
                variant="destructive"
                onClick={dialog.openDelete}
                disabled={dialog.isSubmitting || dialog.isDeleting}
              >
                {t('calendar.deleteConfirm.title')}
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={dialog.handleCancel}>
              {cancelLabel}
            </Button>
          </>
        }
      />
      <DeleteEventConfirmation
        open={dialog.isDeleteOpen}
        onOpenChange={next => {
          if (!next) dialog.closeDelete();
        }}
        eventTitle={dialog.editingEvent?.profile.displayName ?? ''}
        entityLabel={t(dialog.isSubspace ? 'calendar.entity.subspace' : 'calendar.entity.space')}
        onConfirm={dialog.handleConfirmDelete}
        loading={dialog.isDeleting}
      />
    </>
  );
}
