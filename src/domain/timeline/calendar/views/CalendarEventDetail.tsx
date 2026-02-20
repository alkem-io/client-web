import { DialogActions, DialogContent } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader, { DialogHeaderProps } from '@/core/ui/dialog/DialogHeader';
import { BlockTitle } from '@/core/ui/typography';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import AddToCalendarButton from '../components/AddToCalendarButton';
import CalendarEventDetailView from './CalendarEventDetailView';
import useCalendarEvent from './useCalendarEvent';

type CalendarEventDetailProps = {
  eventId: string | undefined;
  onClose: DialogHeaderProps['onClose'];
  actions?: ReactNode;
  dialogTitleId?: string;
};

const CalendarEventDetail = ({ eventId, onClose, actions, dialogTitleId }: CalendarEventDetailProps) => {
  const { t } = useTranslation();
  const { event } = useCalendarEvent({ eventId });
  return (
    <>
      <DialogHeader
        titleContainerProps={{ id: dialogTitleId }}
        onClose={onClose}
        actions={
          <>
            {event && (
              <AddToCalendarButton
                event={{
                  title: event.profile.displayName,
                  startDate: event.startDate,
                  durationMinutes: event.durationMinutes,
                  durationDays: event.durationDays,
                  wholeDay: event.wholeDay,
                  description: event.profile.description,
                  location: event.profile.location?.city,
                }}
              />
            )}
            {event && <ShareButton url={event.profile.url} entityTypeName="event" />}
          </>
        }
      >
        <BlockTitle>
          {t('common.event')}: {event?.profile.displayName}
        </BlockTitle>
      </DialogHeader>
      <DialogContent>
        <CalendarEventDetailView eventId={eventId} />
      </DialogContent>
      <DialogActions>{actions}</DialogActions>
    </>
  );
};

export default CalendarEventDetail;
