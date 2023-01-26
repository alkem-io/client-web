import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Skeleton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { DialogActions, DialogContent, DialogTitle } from '../../../common/components/core/dialog';
import { CalendarEventForm, CalendarEventsContainer } from './CalendarEventsContainer';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import CalendarEventDetail from './views/CalendarEventDetail';
import CalendarEventsList from './views/CalendarEventsList';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import CreateCalendarEvent from './views/CreateCalendarEvent';

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

  const handleClose = () => {
    onClose();
  };

  const handleBackButtonClick = () => {
    navigate(`${EntityPageSection.Dashboard}/calendar`);
  };

  const handleCreateButtonClick = () => {
    setIsCreatingEvent(true);
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="community-updates-dialog-title">
      {hubNameId && (
        <CalendarEventsContainer hubId={hubNameId}>
          {(
            { events },
            { createEvent, updateEvent, deleteEvent /*.... createReference, post a comment,... */ },
            { loading }
          ) => {
            if (isCreatingEvent) {
              const handleNewEventSubmit = async (calendarEvent: CalendarEventForm) => {
                await createEvent(calendarEvent);
                setIsCreatingEvent(false);
              };
              return <CreateCalendarEvent onSubmit={handleNewEventSubmit} onClose={onClose} actions={<Button startIcon={<ArrowBack />} onClick={() => setIsCreatingEvent(false)}>{t('buttons.back')}</Button>} />;
            }
          }}
        </CalendarEventsContainer>
      )}
      <DialogTitle id="calendar-dialog-title" onClose={handleClose}>
        <Box display="flex" alignItems="center">
          {t('dashboard-calendar-section.dialog-title')}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box marginBottom={2}>
          {!hubNameId && <Skeleton variant="rectangular" />}
          {hubNameId && (
            <CalendarEventsContainer hubId={hubNameId}>
              {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                (
                  { events },
                  { createEvent, updateEvent, deleteEvent /*.... createReference, post a comment,... */ },
                  { loading }
                ) => {
                  if (!calendarEventNameId) {
                    return <CalendarEventsList events={events} />;
                  } else {
                    // TODO: Find Events by nameId in the server
                    const event = events.find(event => event.nameID === calendarEventNameId);
                    return <CalendarEventDetail hubNameId={hubNameId} eventId={event?.id} />;
                  }
                }
              }
            </CalendarEventsContainer>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {!calendarEventNameId && <Button onClick={handleCreateButtonClick}>{t('buttons.create')}</Button>}
        {calendarEventNameId && <Button onClick={handleBackButtonClick}>{t('buttons.back')}</Button>}
        <Button onClick={onClose}>{t('buttons.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarDialog;
