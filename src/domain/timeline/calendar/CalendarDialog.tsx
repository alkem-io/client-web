import { useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { Add } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

import CalendarEventForm from './views/CalendarEventForm';
import CalendarEventsList from './views/CalendarEventsList';
import RoundedIcon from '../../../core/ui/icon/RoundedIcon';
import BackButton from '../../../core/ui/actions/BackButton';
import CalendarEventDetail from './views/CalendarEventDetail';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import ConfirmationDialog from '../../../core/ui/dialogs/ConfirmationDialog';
import { CalendarEventFormData, CalendarEventsContainer } from './CalendarEventsContainer';

import useNavigate from '../../../core/routing/useNavigate';
import { dateRounded } from '../../../core/utils/time/utils';
import { useQueryParams } from '../../../core/routing/useQueryParams';
import CalendarEventDetailContainer, { CalendarEventDetailData } from './CalendarEventDetailContainer';
import { TagsetType, CalendarEventDetailsFragment } from '../../../core/apollo/generated/graphql-schema';

// If url params contains `highlight=YYYY-MM-DD` events in that date will be highlighted
export const INIT_CREATING_EVENT_PARAM = 'new';
export const HIGHLIGHT_PARAM_NAME = 'highlight';

const CalendarDialog = ({
  open,
  journeyId,
  onClose,
  parentPath,
  temporaryLocation,
  calendarEventNameId,
}: CalendarDialogProps) => {
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string>();
  const [deletingEvent, setDeletingEvent] = useState<Pick<CalendarEventDetailsFragment, 'id' | 'nameID' | 'profile'>>();

  const { t } = useTranslation();

  const navigate = useNavigate();

  const params = useQueryParams();

  const highlightedDayParam: string | null = params.get(HIGHLIGHT_PARAM_NAME);
  const highlightedDay = useMemo(
    () =>
      highlightedDayParam && dayjs(highlightedDayParam).isValid()
        ? dayjs(highlightedDayParam).startOf('day').toDate()
        : null,
    [highlightedDayParam]
  );

  const handleClose = () => {
    setIsCreatingEvent(false);
    setEditingEventId(undefined);
    setDeletingEvent(undefined);
    onClose();
  };

  const navigateBack = () => navigate(`${parentPath}/calendar`);

  const isCreatingEventInit = params.get(INIT_CREATING_EVENT_PARAM);

  const emptyCalendarEvent: Partial<CalendarEventDetailData> = useMemo(
    () => ({
      startDate: dateRounded(),
      durationMinutes: 30,
      profile: {
        id: '',
        url: '',
        references: [],
        displayName: '',
        description: t('calendar.defaultEventDescription'),
        tagset: { id: '', name: '', tags: [], allowedValues: [], type: TagsetType.Freeform },
      },
      durationDays: 0,
      wholeDay: false,
      type: undefined,
      multipleDays: false,
    }),
    [t]
  );

  return (
    <DialogWithGrid
      open={open}
      columns={12}
      PaperProps={{ sx: { padding: 0, display: `${deletingEvent ? 'none' : 'flex'}`, flexDirection: 'column' } }}
      aria-labelledby="calendar-events-dialog-title"
    >
      <CalendarEventsContainer journeyId={journeyId}>
        {(
          { events, privileges },
          { createEvent, updateEvent, deleteEvent },
          { creatingCalendarEvent, updatingCalendarEvent }
        ) => {
          // Deleting an event:
          if (deletingEvent) {
            const handleDeleteEvent = async (eventId: string) => {
              await deleteEvent(eventId);
              setDeletingEvent(undefined);
              navigateBack();
            };
            return (
              <ConfirmationDialog
                actions={{
                  onCancel: () => setDeletingEvent(undefined),
                  onConfirm: async () => {
                    if (deletingEvent.id) {
                      await handleDeleteEvent(deletingEvent.id);
                    }
                    setDeletingEvent(undefined);
                  },
                }}
                entities={{
                  titleId: 'calendar.delete-event',
                  confirmButtonTextId: 'buttons.delete',
                  content: t('calendar.delete-confirmation', { title: deletingEvent.profile.displayName }),
                }}
                options={{ show: Boolean(deletingEvent) }}
              />
            );

            // Creating a new event:
          } else if (isCreatingEvent || isCreatingEventInit) {
            const handleNewEventSubmit = async (calendarEvent: CalendarEventFormData) => {
              const eventUrl = await createEvent(calendarEvent);
              setIsCreatingEvent(false);
              eventUrl ? navigate(eventUrl) : navigateBack();
            };

            return (
              <CalendarEventForm
                event={emptyCalendarEvent}
                isSubmitting={creatingCalendarEvent}
                temporaryLocation={temporaryLocation}
                dialogTitle={t('calendar.add-event')}
                actions={
                  isCreatingEventInit ? <div>&nbsp;</div> : <BackButton onClick={() => setIsCreatingEvent(false)} />
                }
                onClose={handleClose}
                onSubmit={handleNewEventSubmit}
              />
            );

            // Editing an event:
          } else if (editingEventId) {
            const event = events.find(event => event.nameID === editingEventId || event.id === editingEventId);
            if (!event) {
              setEditingEventId(undefined);

              return;
            }

            const handleEditEventSubmit = async (
              eventId: string,
              tagsetId: string | undefined,
              calendarEvent: CalendarEventFormData
            ) => {
              await updateEvent(eventId, tagsetId, calendarEvent);
              setEditingEventId(undefined);
            };

            return (
              <CalendarEventDetailContainer eventId={event.id}>
                {({ event: eventDetail }) => (
                  <CalendarEventForm
                    event={eventDetail}
                    isSubmitting={updatingCalendarEvent}
                    dialogTitle={t('calendar.edit-event')}
                    actions={<BackButton onClick={() => setEditingEventId(undefined)} />}
                    onClose={handleClose}
                    onSubmit={(calendarEvent: CalendarEventFormData) =>
                      handleEditEventSubmit(event.id, event.profile.tagset?.id, calendarEvent)
                    }
                  />
                )}
              </CalendarEventDetailContainer>
            );
          } else {
            // Events List:
            if (!calendarEventNameId) {
              return (
                <CalendarEventsList
                  events={events}
                  onClose={handleClose}
                  highlightedDay={highlightedDay}
                  actions={
                    privileges.canCreateEvents && (
                      <IconButton onClick={() => setIsCreatingEvent(true)} size="large" sx={{ padding: 0 }}>
                        <RoundedIcon component={Add} size="medium" iconSize="small" />
                      </IconButton>
                    )
                  }
                />
              );
            } else {
              // Event Details:
              const event = events.find(event => event.nameID === calendarEventNameId);

              return (
                <CalendarEventDetail
                  eventId={event?.id}
                  canEdit={privileges.canEditEvents}
                  canDelete={privileges.canDeleteEvents}
                  actions={<BackButton onClick={navigateBack} />}
                  onClose={onClose}
                  onDelete={() => setDeletingEvent(event)}
                  onEdit={() => setEditingEventId(event?.nameID)}
                />
              );
            }
          }
        }}
      </CalendarEventsContainer>
    </DialogWithGrid>
  );
};

export default CalendarDialog;

export interface CalendarDialogProps {
  open: boolean;
  parentPath: string;
  onClose: () => void;
  journeyId: string | undefined;

  temporaryLocation?: boolean;
  calendarEventNameId?: string;
}
