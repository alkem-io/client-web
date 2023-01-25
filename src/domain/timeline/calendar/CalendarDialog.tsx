import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { Box, Button, DialogActions, Skeleton } from '@mui/material';
import { DialogContent, DialogTitle } from '../../../common/components/core/dialog';
import { CalendarEventsContainer } from './CalendarEventsContainer';

export interface CalendarDialogProps {
  open: boolean;
  hubId: string | undefined;
  onClose: () => void;
}

const CalendarDialog: FC<CalendarDialogProps> = ({ open, hubId, onClose }) => {
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
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
          {!hubId && <Skeleton />}
          {hubId &&
          <CalendarEventsContainer hubId={hubId}>
            {({ events }, { createEvent, updateEvent, deleteEvent }, { loading } ) => {
              return (
              <>
                {events.map(event =>
                  <p>{event.displayName} </p>
                  )}
              </>
              );
            }}
          </CalendarEventsContainer>
          }
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('buttons.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarDialog;
