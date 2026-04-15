import { CalendarDays, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { GoogleCalendarIcon, OutlookCalendarIcon } from './icons/CrdAddToCalendarIcons';

type AddToCalendarLinks = {
  googleUrl: string;
  outlookUrl: string;
  icsUrl: string;
  icsFilename: string;
};

type AddToCalendarMenuProps = {
  /** Undefined while loading; component shows a single disabled "Loading…" item. */
  links: AddToCalendarLinks | undefined;
  loading?: boolean;
  /** Localised aria-label for the icon-only trigger button. */
  triggerLabel: string;
  /** Connector-controlled open state to enable lazy URL loading on first open. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Trigger + dropdown for adding the current event to Google / Outlook / ICS.
 *  The trigger is icon-only; the consumer controls open/onOpenChange so the
 *  CalendarEventImportUrls query stays lazy (FR-031, R8). */
export function AddToCalendarMenu({ links, loading, triggerLabel, open, onOpenChange }: AddToCalendarMenuProps) {
  const { t } = useTranslation('crd-space');

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="ghost" size="icon" aria-label={triggerLabel}>
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {loading || !links ? (
          <DropdownMenuItem disabled={true}>{t('calendar.addToCalendar.loading')}</DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem asChild={true}>
              <a
                href={links.googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-2"
              >
                <GoogleCalendarIcon />
                {t('calendar.addToCalendar.google')}
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild={true}>
              <a
                href={links.outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-2"
              >
                <OutlookCalendarIcon />
                {t('calendar.addToCalendar.outlook')}
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild={true}>
              <a href={links.icsUrl} download={links.icsFilename} className="flex cursor-pointer items-center gap-2">
                <Download className="h-4 w-4" aria-hidden="true" />
                {t('calendar.addToCalendar.ics')}
              </a>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
