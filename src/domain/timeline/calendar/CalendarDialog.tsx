import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { Box, Button, DialogActions, Skeleton } from '@mui/material';
import { DialogContent, DialogTitle } from '../../../common/components/core/dialog';
import { CalendarEventsContainer } from './CalendarEventsContainer';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import CalendarEventDetail from './views/CalendarEventDetail';
import CalendarEventsList from './views/CalendarEventsList';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';
import { useNavigate } from 'react-router-dom';

export interface CalendarDialogProps {
  open: boolean;
  hubId: string | undefined;
  onClose: () => void;
}

const CalendarDialog: FC<CalendarDialogProps> = ({ open, hubId, onClose }) => {
  const { t } = useTranslation();
  const { calendarEventNameId } = useUrlParams();
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
  };

  const handleBackButtonClick = () => {
    navigate(`${EntityPageSection.Dashboard}/calendar`);
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="community-updates-dialog-title">
      <DialogTitle id="calendar-dialog-title" onClose={handleClose}>
        <Box display="flex" alignItems="center">
          {t('dashboard-calendar-section.dialog-title')}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box marginBottom={2}>
          {!hubId && <Skeleton variant="rectangular" />}
          {hubId && (
            <CalendarEventsContainer hubId={hubId}>
              {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                (
                  { events },
                  { createEvent, updateEvent, deleteEvent /*.... createReference, post a comment,... */ },
                  { loading }
                ) => {
                  if (!calendarEventNameId) {
                    return <CalendarEventsList events={events} />;
                  } else if (calendarEventNameId === '_add') {
                  } else {
                    const event = events.find(event => event.nameID === calendarEventNameId);
                    return <CalendarEventDetail event={event} />;
                  }
                }
              }
            </CalendarEventsContainer>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {calendarEventNameId && <Button onClick={handleBackButtonClick}>{t('buttons.back')}</Button>}
        <Button onClick={onClose}>{t('buttons.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarDialog;
