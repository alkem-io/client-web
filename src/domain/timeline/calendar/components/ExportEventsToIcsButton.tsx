import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { IconButton, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { markdownToPlainText } from '@/core/ui/markdown/utils/markdownToPlainText';

type ExportEventsToIcsButtonProps = {
  events: {
    id: string;
    type?: string;
    startDate?: Date;
    durationDays?: number | undefined;
    durationMinutes: number | undefined;
    profile: {
      url: string;
      displayName: string;
      description?: string;
    };
  }[];
};

const ExportEventsToIcsButton = ({ events }: ExportEventsToIcsButtonProps) => {
  const { t } = useTranslation();

  const generateIcsContent = (): string => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Alkemio//Calendar Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    events.forEach(event => {
      if (!event.startDate) return;

      const startDate = dayjs(event.startDate);
      const endDate = startDate.add(event.durationMinutes ?? 60, 'minute');

      const formatDateTimeUtc = (date: dayjs.Dayjs) =>
        date
          .toDate()
          .toISOString()
          .replace(/[-:]/g, '')
          .replace(/\.\d{3}/, '');

      const escapeText = (text: string) => {
        return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
      };

      lines.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@alkemio.org`,
        `DTSTAMP:${formatDateTimeUtc(dayjs())}`,
        `DTSTART:${formatDateTimeUtc(startDate)}`,
        `DTEND:${formatDateTimeUtc(endDate)}`,
        `SUMMARY:${escapeText(event.profile.displayName)}`
      );

      if (event.profile.description) {
        const plainTextDescription = markdownToPlainText(event.profile.description);
        lines.push(`DESCRIPTION:${escapeText(plainTextDescription)}`);
      }

      if (event.profile.url) {
        lines.push(`URL:${event.profile.url}`);
      }

      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');

    return lines.join('\r\n');
  };

  const handleExport = () => {
    const icsContent = generateIcsContent();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `alkemio-events-${dayjs().format('YYYY-MM-DD')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <Tooltip title={t('calendar.addToCalendar.exportAll')} arrow>
      <IconButton onClick={handleExport} size="small" aria-label={t('calendar.addToCalendar.exportAll')}>
        <FileDownloadOutlinedIcon color="primary" />
      </IconButton>
    </Tooltip>
  );
};

export default ExportEventsToIcsButton;
