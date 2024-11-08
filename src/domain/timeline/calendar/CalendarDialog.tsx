import { Add } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '../../../core/routing/useNavigate';
import RoundedIcon from '../../../core/ui/icon/RoundedIcon';
import { CalendarEventDetailsFragment, TagsetType } from '../../../core/apollo/generated/graphql-schema';
import { useQueryParams } from '../../../core/routing/useQueryParams';
import BackButton from '../../../core/ui/actions/BackButton';
import { dateRounded } from '../../../core/utils/time/utils';
import CalendarEventDetailContainer, { CalendarEventDetailData } from './CalendarEventDetailContainer';
import { CalendarEventFormData, CalendarEventsContainer } from './CalendarEventsContainer';
import CalendarEventDetail from './views/CalendarEventDetail';
import CalendarEventForm from './views/CalendarEventForm';
import CalendarEventsList from './views/CalendarEventsList';
import dayjs from 'dayjs';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import ConfirmationDialog from '../../../core/ui/dialogs/ConfirmationDialog';

// If url params contains `highlight=YYYY-MM-DD` events in that date will be highlighted
export const HIGHLIGHT_PARAM_NAME = 'highlight';
export const INIT_CREATING_EVENT_PARAM = 'new';

export interface CalendarDialogProps {
  open: boolean;
  journeyId: string | undefined;
  onClose: () => void;
  parentPath: string;
  calendarEventNameId?: string;
  temporaryLocation?: boolean;
  isSubspace?: boolean;
}

const CalendarDialog: FC<CalendarDialogProps> = ({
  open,
  journeyId,
  onClose,
  parentPath,
  calendarEventNameId,
  temporaryLocation = false,
  isSubspace = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const params = useQueryParams();
  const isCreatingEventInit = params.get(INIT_CREATING_EVENT_PARAM);
  const highlightedDayParam: string | null = params.get(HIGHLIGHT_PARAM_NAME);
  const highlightedDay = useMemo(
    () =>
      highlightedDayParam && dayjs(highlightedDayParam).isValid()
        ? dayjs(highlightedDayParam).startOf('day').toDate()
        : null,
    [highlightedDayParam]
  );

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string>();
  const [deletingEvent, setDeletingEvent] = useState<Pick<CalendarEventDetailsFragment, 'id' | 'nameID' | 'profile'>>();

  const handleClose = () => {
    setIsCreatingEvent(false);
    setEditingEventId(undefined);
    setDeletingEvent(undefined);
    onClose();
  };

  const navigateBack = () => {
    return navigate(`${parentPath}/calendar`);
  };

  const emptyCalendarEvent: Partial<CalendarEventDetailData> = useMemo(
    () => ({
      startDate: dateRounded(),
      durationMinutes: 30,
      profile: {
        id: '',
        url: '',
        displayName: '',
        description: t('calendar.defaultEventDescription'),
        references: [],
        tagset: { id: '', name: '', tags: [], allowedValues: [], type: TagsetType.Freeform },
      },
      multipleDays: false,
      durationDays: 0,
      wholeDay: false,
      type: undefined,
    }),
    [t]
  );

  return (
    <DialogWithGrid
      columns={12}
      open={open}
      aria-labelledby="calendar-events-dialog-title"
      PaperProps={{ sx: { padding: 0, display: `${deletingEvent ? 'none' : 'flex'}`, flexDirection: 'column' } }}
    >
      <CalendarEventsContainer journeyId={journeyId} includeSubspace={!isSubspace}>
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
                  confirmButtonTextId: 'buttons.delete',
                  content: t('calendar.delete-confirmation', {
                    title: deletingEvent.profile.displayName,
                    entity: t(`common.${isSubspace ? 'subspace' : 'space'}`),
                  }),
                  titleId: 'calendar.delete-event',
                }}
                options={{
                  show: Boolean(deletingEvent),
                }}
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
                dialogTitle={t('calendar.add-event')}
                event={emptyCalendarEvent}
                onSubmit={handleNewEventSubmit}
                onClose={handleClose}
                isSubmitting={creatingCalendarEvent}
                actions={
                  isCreatingEventInit ? <div>&nbsp;</div> : <BackButton onClick={() => setIsCreatingEvent(false)} />
                }
                temporaryLocation={temporaryLocation}
                isSubspace={isSubspace}
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
                    dialogTitle={t('calendar.edit-event')}
                    event={eventDetail}
                    onSubmit={(calendarEvent: CalendarEventFormData) =>
                      handleEditEventSubmit(event.id, event.profile.tagset?.id, calendarEvent)
                    }
                    onClose={handleClose}
                    isSubmitting={updatingCalendarEvent}
                    actions={<BackButton onClick={() => setEditingEventId(undefined)} />}
                    isSubspace={isSubspace}
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
                  onClose={onClose}
                  canEdit={privileges.canEditEvents}
                  onEdit={() => setEditingEventId(event?.nameID)}
                  canDelete={privileges.canDeleteEvents}
                  onDelete={() => setDeletingEvent(event)}
                  actions={<BackButton onClick={navigateBack} />}
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
