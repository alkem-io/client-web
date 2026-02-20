import { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { useTranslation } from 'react-i18next';

interface AddToCalendarEvent {
  title: string;
  startDate?: Date;
  durationMinutes: number;
  durationDays?: number;
  wholeDay?: boolean;
  description?: string;
  location?: string;
}

interface AddToCalendarButtonProps {
  event: AddToCalendarEvent;
}

const formatDateTimeUTC = (date: Date): string =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

const formatDateOnlyUTC = (date: Date): string => date.toISOString().split('T')[0].replace(/-/g, '');

const getEndDate = (startDate: Date, durationMinutes: number, durationDays: number, wholeDay: boolean): Date => {
  if (wholeDay) {
    const end = new Date(startDate);
    end.setUTCDate(end.getUTCDate() + Math.max(durationDays, 1));
    return end;
  }
  return new Date(startDate.getTime() + durationMinutes * 60000);
};

const AddToCalendarButton = ({ event }: AddToCalendarButtonProps) => {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (!event.startDate) {
    return null;
  }

  const startDate = new Date(event.startDate);
  const wholeDay = event.wholeDay ?? false;
  const durationMinutes = event.durationMinutes ?? 0;
  const durationDays = event.durationDays ?? 0;
  const endDate = getEndDate(startDate, durationMinutes, durationDays, wholeDay);

  const startStr = wholeDay ? formatDateOnlyUTC(startDate) : formatDateTimeUTC(startDate);
  const endStr = wholeDay ? formatDateOnlyUTC(endDate) : formatDateTimeUTC(endDate);

  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(event.description ?? '');
  const location = encodeURIComponent(event.location ?? '');

  const googleUrl =
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}` +
    `&dates=${startStr}/${endStr}&details=${description}&location=${location}`;

  const outlookUrl =
    `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}` +
    `&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}` +
    `&body=${description}&location=${location}${wholeDay ? '&allday=true' : ''}`;

  const yahooUrl =
    `https://calendar.yahoo.com/?v=60&title=${title}&st=${startStr}&et=${endStr}` +
    `&desc=${description}&in_loc=${location}`;

  const dtStartLine = wholeDay ? `DTSTART;VALUE=DATE:${startStr}` : `DTSTART:${startStr}`;
  const dtEndLine = wholeDay ? `DTEND;VALUE=DATE:${endStr}` : `DTEND:${endStr}`;
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alkemio//Calendar//EN',
    'BEGIN:VEVENT',
    dtStartLine,
    dtEndLine,
    `SUMMARY:${event.title.replace(/,/g, '\\,')}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}` : '',
    event.location ? `LOCATION:${event.location.replace(/,/g, '\\,')}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  const icsHref = `data:text/calendar;charset=utf8,${encodeURIComponent(icsLines)}`;
  const icsFilename = `${event.title}.ics`;

  const handleClose = () => setAnchor(null);

  return (
    <>
      <Tooltip title={t('calendar.add-to-calendar.button')} arrow placement="top">
        <IconButton
          aria-label={t('calendar.add-to-calendar.button')}
          aria-haspopup="true"
          onClick={e => setAnchor(e.currentTarget)}
          sx={{ color: theme => theme.palette.text.primary }}
        >
          <EventOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={handleClose}>
        <MenuItem component="a" href={googleUrl} target="_blank" rel="noopener noreferrer" onClick={handleClose}>
          {t('calendar.add-to-calendar.google')}
        </MenuItem>
        <MenuItem component="a" href={outlookUrl} target="_blank" rel="noopener noreferrer" onClick={handleClose}>
          {t('calendar.add-to-calendar.outlook')}
        </MenuItem>
        <MenuItem component="a" href={yahooUrl} target="_blank" rel="noopener noreferrer" onClick={handleClose}>
          {t('calendar.add-to-calendar.yahoo')}
        </MenuItem>
        <MenuItem component="a" href={icsHref} download={icsFilename} onClick={handleClose}>
          {t('calendar.add-to-calendar.ical')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default AddToCalendarButton;
