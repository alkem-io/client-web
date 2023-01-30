import { Add } from '@mui/icons-material';
import { Button, IconButton, Skeleton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DialogContent } from '../../../common/components/core/dialog';
import RoundedIcon from '../../../core/ui/icon/RoundedIcon';
import { CalendarEvent } from '../../../core/apollo/generated/graphql-schema';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import { Actions } from '../../../core/ui/actions/Actions';
import BackButton from '../../../core/ui/actions/BackButton';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import { gutters } from '../../../core/ui/grid/utils';
import { BlockTitle } from '../../../core/ui/typography';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import { dateRounded } from '../../../core/utils/time/utils';
import CalendarEventDetailContainer, { CalendarEventDetailData } from './CalendarEventDetailContainer';
import { CalendarEventFormData, CalendarEventsContainer } from './CalendarEventsContainer';
import CalendarEventDetail from './views/CalendarEventDetail';
import CalendarEventForm from './views/CalendarEventForm';
import CalendarEventsList from './views/CalendarEventsList';

export interface CalendarDialogProps {
  open: boolean;
  hubNameId: string | undefined;
  onClose: () => void;
}

const CalendarDialog: FC<CalendarDialogProps> = ({ open, hubNameId, onClose }) => {
  const { t } = useTranslation();
  const { calendarEventNameId } = useUrlParams();
  const navigate = useNavigate();

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string>();
  const [deletingEvent, setDeletingEvent] = useState<Pick<CalendarEvent, 'id' | 'nameID' | 'displayName'>>();

  const handleClose = () => {
    setIsCreatingEvent(false);
    setEditingEventId(undefined);
    setDeletingEvent(undefined);
    onClose();
  };

  const emptyCalendarEvent: Partial<CalendarEventDetailData> = useMemo(
    () => ({
      startDate: dateRounded(),
      durationMinutes: 30,
      displayName: '',
      profile: {
        id: '',
        description: '',
        references: [],
        tagset: { id: '', name: '', tags: [] },
      },
      multipleDays: false,
      durationDays: 0,
      wholeDay: false,
      type: undefined,
    }),
    []
  );

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      aria-labelledby="calendar-events-dialog-title"
      PaperProps={{ sx: { padding: 0, display: 'flex', flexDirection: 'column' } }}
    >
      {!hubNameId && <Skeleton variant="rectangular" />}
      {hubNameId && (
        <CalendarEventsContainer hubId={hubNameId}>
          {({ events, privileges }, { createEvent, updateEvent, deleteEvent }) => {
            // Deleting an event:
            if (deletingEvent) {
              const handleDeleteEvent = async (eventId: string) => {
                await deleteEvent(eventId);
                setDeletingEvent(undefined);
                navigate(`${EntityPageSection.Dashboard}/calendar`);
              };
              return (
                <>
                  <DialogHeader onClose={() => setDeletingEvent(undefined)}>{t('calendar.delete-event')}</DialogHeader>
                  <DialogContent>
                    <BlockTitle>{t('calendar.delete-confirmation', { title: deletingEvent.displayName })}</BlockTitle>
                    <Actions justifyContent="space-around" marginTop={gutters()}>
                      <Button onClick={() => handleDeleteEvent(deletingEvent.id)}>{t('buttons.delete')}</Button>
                      <Button onClick={() => setDeletingEvent(undefined)} variant="contained">
                        {t('buttons.cancel')}
                      </Button>
                    </Actions>
                  </DialogContent>
                </>
              );

              // Creating a new event:
            } else if (isCreatingEvent) {
              const handleNewEventSubmit = async (calendarEvent: CalendarEventFormData) => {
                await createEvent(calendarEvent);
                setIsCreatingEvent(false);
              };

              return (
                <CalendarEventForm
                  dialogTitle={t('calendar.add-event')}
                  event={emptyCalendarEvent}
                  onSubmit={handleNewEventSubmit}
                  onClose={handleClose}
                  actions={<BackButton onClick={() => setIsCreatingEvent(false)} />}
                />
              );

              // Editing an event:
            } else if (editingEventId) {
              const event = events.find(event => event.nameID === editingEventId || event.id === editingEventId);
              if (!event) {
                setEditingEventId(undefined);
                return;
              }

              const handleEditEventSubmit = async (eventId: string, calendarEvent: CalendarEventFormData) => {
                await updateEvent(eventId, calendarEvent);
                setEditingEventId(undefined);
              };

              return (
                <CalendarEventDetailContainer hubNameId={hubNameId} eventId={event.id}>
                  {({ event: eventDetail }) => (
                    <CalendarEventForm
                      dialogTitle={t('calendar.edit-event')}
                      event={eventDetail}
                      onSubmit={(calendarEvent: CalendarEventFormData) =>
                        handleEditEventSubmit(event.id, calendarEvent)
                      }
                      onClose={handleClose}
                      actions={<BackButton onClick={() => setEditingEventId(undefined)} />}
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
                    actions={
                      <IconButton onClick={() => setIsCreatingEvent(true)} size="large" sx={{ padding: 0 }}>
                        <RoundedIcon component={Add} size="medium" iconSize="small" />
                      </IconButton>
                    }
                  />
                );
              } else {
                // Event Details:
                const event = events.find(event => event.nameID === calendarEventNameId);
                return (
                  <CalendarEventDetail
                    hubNameId={hubNameId}
                    eventId={event?.id}
                    onClose={onClose}
                    canEdit={privileges.canEditEvents}
                    onEdit={() => setEditingEventId(event?.nameID)}
                    canDelete={privileges.canDeleteEvents}
                    onDelete={() => setDeletingEvent(event)}
                    actions={<BackButton onClick={() => navigate(`${EntityPageSection.Dashboard}/calendar`)} />}
                  />
                );
              }
            }
          }}
        </CalendarEventsContainer>
      )}
    </Dialog>
  );
};

export default CalendarDialog;
