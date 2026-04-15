import dayjs from 'dayjs';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { markdownToPlainText } from '@/core/ui/markdown/utils/markdownToPlainText';
import { Button } from '@/crd/primitives/button';
import { escapeIcsText, foldLine, formatDateTimeUtc } from '@/domain/timeline/calendar/utils/icsUtils';

type ExportableEvent = {
  id: string;
  title: string;
  description?: string;
  startDate: Date | undefined;
  durationMinutes: number;
  url: string;
};

type ExportEventsToIcsConnectorProps = {
  /** Future events only — the consumer (the dialog connector) is responsible
   *  for filtering. The button hides itself when the list is empty. */
  events: ExportableEvent[];
};

const ICS_HEADER = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Alkemio//Calendar Events//EN',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
];

function buildIcsContent(events: ExportableEvent[]): string {
  const lines: string[] = [...ICS_HEADER];

  for (const event of events) {
    if (!event.startDate) continue;
    const startDate = dayjs(event.startDate);
    const endDate = startDate.add(event.durationMinutes ?? 60, 'minute');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@alkemio.org`,
      `DTSTAMP:${formatDateTimeUtc(dayjs())}`,
      `DTSTART:${formatDateTimeUtc(startDate)}`,
      `DTEND:${formatDateTimeUtc(endDate)}`,
      `SUMMARY:${escapeIcsText(event.title)}`
    );

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(markdownToPlainText(event.description))}`);
    }

    if (event.url) {
      lines.push(`URL:${event.url}`);
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n');
}

/** Icon-only button that builds an .ics blob from the supplied events and
 *  triggers a download. Hidden when the list is empty. */
export function ExportEventsToIcsConnector({ events }: ExportEventsToIcsConnectorProps) {
  const { t } = useTranslation('crd-space');

  if (events.length === 0) return null;

  const handleExport = () => {
    const blob = new Blob([buildIcsContent(events)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alkemio-events-${dayjs().format('YYYY-MM-DD')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const label = t('calendar.addToCalendar.exportAll');

  return (
    <Button variant="ghost" size="icon" onClick={handleExport} aria-label={label} title={label}>
      <Download className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
