import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Skeleton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DialogContent } from '../../../common/components/core/dialog';
import { CalendarEventForm, CalendarEventsContainer } from './CalendarEventsContainer';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import CalendarEventDetail from './views/CalendarEventDetail';
import CalendarEventsList from './views/CalendarEventsList';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import CreateCalendarEvent from './views/CreateCalendarEvent';
import IconButton from '../../../common/components/core/IconButton';

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
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="community-updates-dialog-title">
      <DialogContent dividers>
        <Box marginBottom={2}>
          {!hubNameId && <Skeleton variant="rectangular" />}
          {hubNameId && (
            <CalendarEventsContainer hubId={hubNameId}>
              {(
                { events, privileges },
                { createEvent, updateEvent, deleteEvent },
                { loading }
              ) => {
                const handleNewEventSubmit = async (calendarEvent: CalendarEventForm) => {
                  await createEvent(calendarEvent);
                  setIsCreatingEvent(false);
                };
                const handleEditEventSubmit = async (eventId: string, calendarEvent: CalendarEventForm) => {
                  await updateEvent(eventId, calendarEvent);
                  setIsCreatingEvent(false);
                };
                const handleDeleteEvent = async (eventId: string) => {
                  await deleteEvent(eventId);
                };

                if (isCreatingEvent) {
                  // Create event form
                  return (
                    <CreateCalendarEvent
                      dialogTitle={t('calendar.add-event')}
                      onSubmit={handleNewEventSubmit}
                      onClose={handleClose}
                      actions={<Button startIcon={<ArrowBackIcon />} onClick={() => setIsCreatingEvent(false)}>{t('buttons.back')}</Button>}
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
                    <CreateCalendarEvent
                      dialogTitle={event.displayName}
                      onSubmit={(calendarEvent: CalendarEventForm) => handleEditEventSubmit(event.id, calendarEvent)}
                      onClose={handleClose}
                      actions={<Button startIcon={<ArrowBackIcon />} onClick={() => setEditingEvent(undefined)}>{t('buttons.back')}</Button>}
                    />
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
