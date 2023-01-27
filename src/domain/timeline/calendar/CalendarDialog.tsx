import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Skeleton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DialogContent } from '../../../common/components/core/dialog';
import IconButton from '../../../common/components/core/IconButton';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import { Actions } from '../../../core/ui/actions/Actions';
import DialogHeader from '../../../core/ui/dialog/DialogHeader';
import { gutters } from '../../../core/ui/grid/utils';
import { BlockTitle } from '../../../core/ui/typography';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import CalendarEventDetailContainer from './CalendarEventDetailContainer';
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
  const [editingEvent, setEditingEvent] = useState<string>();
  const [deletingEvent, setDeletingEvent] = useState<string>();

  const handleClose = () => {
    setIsCreatingEvent(false);
    setEditingEvent(undefined);
    onClose();
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="calendar-events-dialog-title">
      <DialogContent dividers>
        <Box marginBottom={2}>
          {!hubNameId && <Skeleton variant="rectangular" />}
          {hubNameId && (
            <CalendarEventsContainer hubId={hubNameId}>
              {({ events, privileges }, { createEvent, updateEvent, deleteEvent }) => {
                const handleNewEventSubmit = async (calendarEvent: CalendarEventFormData) => {
                  await createEvent(calendarEvent);
                  setIsCreatingEvent(false);
                };
                const handleEditEventSubmit = async (eventId: string, calendarEvent: CalendarEventFormData) => {
                  await updateEvent(eventId, calendarEvent);
                  setEditingEvent(undefined);
                };
                const handleDeleteEvent = async (eventId: string) => {
                  await deleteEvent(eventId);
                  setDeletingEvent(undefined);
                };
                if (deletingEvent) {
                  return (
                    <Dialog open maxWidth="md">
                      <DialogHeader onClose={() => setDeletingEvent(undefined)}>
                        {t('calendar.delete-event')}
                      </DialogHeader>
                      <BlockTitle margin={gutters(3)}>{t('calendar.delete-confirmation')}</BlockTitle>
                      <Actions width="50%" marginX="auto">
                        <Button onClick={() => handleDeleteEvent(deletingEvent)}>{t('buttons.delete')}</Button>
                        <Button onClick={() => setDeletingEvent(undefined)} variant="contained">
                          {t('buttons.cancel')}
                        </Button>
                      </Actions>
                    </Dialog>
                  );
                }
                if (isCreatingEvent) {
                  // Create event form
                  return (
                    <CalendarEventForm
                      onSubmit={handleNewEventSubmit}
                      onClose={handleClose}
                      actions={
                        <Button startIcon={<ArrowBackIcon />} onClick={() => setIsCreatingEvent(false)}>
                          {t('buttons.back')}
                        </Button>
                      }
                    />
                  );
                } else if (editingEvent) {
                  // Update event form
                  const event = events.find(event => event.nameID === editingEvent);
                  if (!event) {
                    setEditingEvent(undefined);
                    return;
                  }
                  return (
                    <CalendarEventDetailContainer hubNameId={hubNameId} eventId={event.id}>
                      {({ event: eventDetail }) => (
                        <CalendarEventForm
                          event={eventDetail}
                          onSubmit={(calendarEvent: CalendarEventFormData) =>
                            handleEditEventSubmit(event.id, calendarEvent)
                          }
                          onClose={handleClose}
                          actions={
                            <Button startIcon={<ArrowBackIcon />} onClick={() => setEditingEvent(undefined)}>
                              {t('buttons.back')}
                            </Button>
                          }
                        />
                      )}
                    </CalendarEventDetailContainer>
                  );
                } else {
                  if (!calendarEventNameId) {
                    // Events list:
                    return (
                      <CalendarEventsList
                        events={events}
                        onClose={handleClose}
                        actions={
                          <IconButton onClick={() => setIsCreatingEvent(true)} size="large" variant="contained">
                            <AddIcon fontSize="large" />
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
                        onEdit={() => setEditingEvent(event?.nameID)}
                        canDelete={privileges.canDeleteEvents}
                        onDelete={() => setDeletingEvent(event?.nameID)}
                        actions={
                          <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(`${EntityPageSection.Dashboard}/calendar`)}
                          >
                            {t('buttons.back')}
                          </Button>
                        }
                      />
                    );
                  }
                }
              }}
            </CalendarEventsContainer>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarDialog;
