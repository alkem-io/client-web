import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalendarEventImportUrlsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AddToCalendarMenu } from '@/crd/components/space/timeline/AddToCalendarMenu';
import { mapCalendarEventImportUrlsToLinks } from '../dataMappers/calendarEventDataMapper';

type AddToCalendarMenuConnectorProps = {
  eventId: string;
  /** Localised aria-label override; defaults to t('calendar.addToCalendar.trigger'). */
  triggerLabel?: string;
};

/** Lazy-loads the external-calendar URLs on first dropdown open. Once the
 *  query has run we keep it subscribed so subsequent opens are instant
 *  (Apollo cache hit). Matches the MUI behaviour (R8). */
export function AddToCalendarMenuConnector({ eventId, triggerLabel }: AddToCalendarMenuConnectorProps) {
  const { t } = useTranslation('crd-space');
  const [open, setOpen] = useState(false);
  // Once we've opened the menu at least once, leave the query mounted to
  // avoid a refetch on subsequent opens.
  const [hasOpened, setHasOpened] = useState(false);

  const { data, loading } = useCalendarEventImportUrlsQuery({
    variables: { eventId },
    skip: !hasOpened,
  });

  const event = data?.lookup.calendarEvent;
  const links = event ? mapCalendarEventImportUrlsToLinks(event) : undefined;

  return (
    <AddToCalendarMenu
      links={links}
      loading={loading}
      triggerLabel={triggerLabel ?? t('calendar.addToCalendar.trigger')}
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (next) setHasOpened(true);
      }}
    />
  );
}
