import { IconButton, Menu, MenuItem, ListItemIcon as MUIListItemIcon, styled, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalendarEventImportUrlsQuery } from '@/core/apollo/generated/apollo-hooks';
import { gutters } from '@/core/ui/grid/utils';
import Loading from '@/core/ui/loading/Loading';
import type { Identifiable } from '@/core/utils/Identifiable';
import {
  ExportCalendarEventIcon,
  GoogleCalendarIcon,
  IcsDownloadIcon,
  OutlookCalendarIcon,
} from './icons/AddToCalendarIcons';

interface AddToCalendarButtonProps {
  event: Identifiable;
}

const ListItemIcon = styled(MUIListItemIcon)(({ theme }) => ({
  marginRight: gutters(0.5)(theme),
}));

const AddToCalendarButton = ({ event }: AddToCalendarButtonProps) => {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const { data, loading } = useCalendarEventImportUrlsQuery({
    variables: { eventId: event.id },
    skip: !event.id || !anchor,
  });

  if (!event.id) {
    return null;
  }

  const eventData = data?.lookup?.calendarEvent;
  const icsFilename = `${eventData?.profile.displayName || 'event'}.ics`;

  const handleClose = () => setAnchor(null);

  return (
    <>
      <Tooltip title={t('calendar.addToCalendar.button')} arrow={true} placement="top">
        <IconButton
          aria-label={t('calendar.addToCalendar.button')}
          aria-haspopup="true"
          onClick={e => setAnchor(e.currentTarget)}
          sx={{ color: theme => theme.palette.text.primary }}
        >
          <ExportCalendarEventIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={handleClose}>
        {loading || !eventData ? (
          <MenuItem disabled={true}>
            <Loading />
          </MenuItem>
        ) : (
          <>
            <MenuItem
              component="a"
              href={eventData.googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
            >
              <ListItemIcon>
                <GoogleCalendarIcon />
              </ListItemIcon>
              {t('calendar.addToCalendar.google')}
            </MenuItem>
            <MenuItem
              component="a"
              href={eventData.outlookCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
            >
              <ListItemIcon>
                <OutlookCalendarIcon />
              </ListItemIcon>
              {t('calendar.addToCalendar.outlook')}
            </MenuItem>
            <MenuItem component="a" href={eventData.icsDownloadUrl} download={icsFilename} onClick={handleClose}>
              <ListItemIcon>
                <IcsDownloadIcon />
              </ListItemIcon>
              {t('calendar.addToCalendar.iCal')}
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default AddToCalendarButton;
