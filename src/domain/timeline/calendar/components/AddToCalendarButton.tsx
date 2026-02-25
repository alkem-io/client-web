import { useState } from 'react';
import { IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from '@mui/material';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { useTranslation } from 'react-i18next';
import { AppleIcon, GoogleCalendarIcon, OutlookCalendarIcon, CalendarIcon } from './icons/AddToCalendarIcons';
import { Identifiable } from '@/core/utils/Identifiable';
import { useCalendarEventImportUrlsQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';

interface AddToCalendarButtonProps {
  event: Identifiable;
}

const AddToCalendarButton = ({ event }: AddToCalendarButtonProps) => {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const { data, loading } = useCalendarEventImportUrlsQuery({
    variables: { eventId: event.id },
    skip: !event.id || !Boolean(anchor),
  });

  if (!event.id) {
    return null;
  }

  const eventData = data?.lookup?.calendarEvent;
  const icsFilename = `${eventData?.profile.displayName || 'event'}.ics`;

  const handleClose = () => setAnchor(null);

  return (
    <>
      <Tooltip title={t('calendar.addToCalendar.button')} arrow placement="top">
        <IconButton
          aria-label={t('calendar.addToCalendar.button')}
          aria-haspopup="true"
          onClick={e => setAnchor(e.currentTarget)}
          sx={{ color: theme => theme.palette.text.primary }}
        >
          <EventOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={handleClose}>
        {loading || !eventData ? (
          <MenuItem disabled>
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
            <MenuItem component="a" href={eventData.appleCalendarUrl} download={icsFilename} onClick={handleClose}>
              <ListItemIcon>
                <AppleIcon />
              </ListItemIcon>
              {t('calendar.addToCalendar.apple')}
            </MenuItem>
            <MenuItem component="a" href={eventData.icsDownloadUrl} download={icsFilename} onClick={handleClose}>
              <ListItemIcon>
                <CalendarIcon />
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
