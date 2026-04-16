import { isSameDay } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type CalendarEventInfoFragment, CalendarEventType } from '@/core/apollo/generated/graphql-schema';
import type { CalendarEventFormData } from '@/domain/timeline/calendar/useCalendarEvents';
import type { EventFormValues } from '../dataMappers/calendarEventDataMapper';
import type { CrdCalendarUrlState } from './useCrdCalendarUrlState';
import { useCrdEventForm } from './useCrdEventForm';

/**
 * Owns the create/edit/delete slice of the calendar dialog: form state, edit
 * prefill, delete confirmation state, payload normalisation, and submit
 * handlers (each wired to the right domain action and follow-up navigation).
 *
 * The parent dialog connector mounts a wrapper component that calls this hook
 * with `key={editingEventId ?? 'create'}` so React remounts a fresh hook per
 * event — that drives the `initialValues` seeding declaratively, eliminating
 * the previous `useRef` prefill anti-pattern.
 */
export type UseCrdEventFormDialogParams = {
  mode: 'create' | 'edit';
  /** Required when mode === 'edit'; ignored otherwise. */
  editingEventId: string | undefined;
  events: CalendarEventInfoFragment[];
  actions: {
    createEvent: (event: CalendarEventFormData) => Promise<string | undefined>;
    updateEvent: (
      eventId: string,
      event: CalendarEventFormData,
      // The MUI hook accepts a TagsetModel here (mutable shape on update).
      // Using `unknown` keeps this hook agnostic of the domain TagsetModel
      // import path; the parent passes the right value through.
      tagset: NonNullable<CalendarEventInfoFragment['profile']['tagset']>
    ) => Promise<string | undefined>;
    deleteEvent: (eventId: string) => Promise<void>;
  };
  urlState: CrdCalendarUrlState;
  parentSpaceId: string | undefined;
  isCreating: boolean;
  isUpdating: boolean;
  /** Called when the user cancels an edit OR a save/delete completes — clears
   *  the parent's `editingEventId` so the dialog returns to the prior view. */
  onExitEdit: () => void;
};

export type UseCrdEventFormDialogResult = {
  values: EventFormValues;
  errors: ReturnType<typeof useCrdEventForm>['errors'];
  setField: ReturnType<typeof useCrdEventForm>['setField'];

  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;

  isDeleteOpen: boolean;
  openDelete: () => void;
  closeDelete: () => void;
  isDeleting: boolean;
  handleConfirmDelete: () => Promise<void>;

  isSubspace: boolean;
  editingEvent: CalendarEventInfoFragment | undefined;
  typeOptions: { value: string; label: string }[];
};

function buildEditInitialValues(event: CalendarEventInfoFragment): Partial<EventFormValues> {
  const startDate = event.startDate ? new Date(event.startDate) : undefined;
  const endDate = startDate ? new Date(startDate.getTime() + event.durationMinutes * 60_000) : undefined;
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

function toDomainPayload(values: EventFormValues): CalendarEventFormData | undefined {
  const { displayName, type, startDate, endDate, wholeDay, description, locationCity, tags, visibleOnParentCalendar } =
    values;
  if (!startDate || !endDate || !type) return undefined;

  let durationMinutes = values.durationMinutes ?? 0;
  let durationDays = 0;
  let multipleDays = false;

  // Mirrors useCalendarEvents.createEvent (lines 103-115): when start and end
  // are different days, recompute the duration from the date diff.
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
}

export function useCrdEventFormDialog({
  mode,
  editingEventId,
  events,
  actions,
  urlState,
  parentSpaceId,
  isCreating,
  isUpdating,
  onExitEdit,
}: UseCrdEventFormDialogParams): UseCrdEventFormDialogResult {
  const { t } = useTranslation('crd-space');

  const editingEvent = editingEventId ? events.find(e => e.id === editingEventId) : undefined;

  // Seed the form once at mount (lazy useState init inside useCrdEventForm).
  // The parent remounts this hook via `key={editingEventId ?? 'create'}`, so a
  // different event id produces a fresh seeding without manual refs.
  const initialValues = mode === 'edit' && editingEvent ? buildEditInitialValues(editingEvent) : undefined;
  const form = useCrdEventForm(initialValues);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSubspace = Boolean(parentSpaceId);
  const isSubmitting = mode === 'create' ? isCreating : isUpdating;

  const typeOptions = Object.values(CalendarEventType).map(value => ({
    value,
    label: t(`calendar.type.${value}`),
  }));

  const handleCreateSubmit = async () => {
    if (!form.validate()) return;
    const payload = toDomainPayload(form.values);
    if (!payload) return;
    const eventUrl = await actions.createEvent(payload);
    form.clearForm();
    if (eventUrl) {
      urlState.navigateToEvent(eventUrl);
    } else {
      urlState.navigateToList();
    }
  };

  const handleEditSubmit = async () => {
    if (!form.validate() || !editingEvent?.profile.tagset) return;
    const payload = toDomainPayload(form.values);
    if (!payload) return;

    await actions.updateEvent(editingEvent.id, payload, editingEvent.profile.tagset);
    onExitEdit();
    // Return to detail view via the existing event URL (no need to refetch).
    urlState.navigateToEvent(editingEvent.profile.url);
  };

  const handleSubmit = mode === 'create' ? handleCreateSubmit : handleEditSubmit;

  const handleCancel = () => {
    if (mode === 'edit') {
      onExitEdit();
    } else {
      // Cancel create — clear ?new=1 and return to list. The wrapper unmounts
      // when `view` flips back to 'list', so no need to clearForm() — the
      // remount on next entry seeds fresh.
      urlState.navigateToList();
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingEvent) return;
    setIsDeleting(true);
    try {
      await actions.deleteEvent(editingEvent.id);
      // Successful delete (FR-029): close the confirmation, exit edit, send
      // the dialog back to the list view. The wrapper then unmounts.
      setIsDeleteOpen(false);
      onExitEdit();
      urlState.navigateToList();
    } finally {
      setIsDeleting(false);
    }
  };

  const openDelete = () => setIsDeleteOpen(true);
  const closeDelete = () => {
    if (!isDeleting) setIsDeleteOpen(false);
  };

  return {
    values: form.values,
    errors: form.errors,
    setField: form.setField,

    isSubmitting,
    handleSubmit,
    handleCancel,

    isDeleteOpen,
    openDelete,
    closeDelete,
    isDeleting,
    handleConfirmDelete,

    isSubspace,
    editingEvent,
    typeOptions,
  };
}
