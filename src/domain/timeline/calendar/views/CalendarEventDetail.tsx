import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { Button, DialogContent, IconButton } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader, { DialogHeaderProps } from '@/core/ui/dialog/DialogHeader';
import { gutters } from '@/core/ui/grid/utils';
import { BlockTitle } from '@/core/ui/typography';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import CalendarEventDetailView from './CalendarEventDetailView';
import useCalendarEvent from './useCalendarEvent';

type CalendarEventDetailProps = {
  eventId: string | undefined;
  onClose: DialogHeaderProps['onClose'];
  canEdit?: boolean;
  onEdit?: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
  actions?: ReactNode;
};

const CalendarEventDetail = ({
  eventId,
  onClose,
  canEdit = false,
  onEdit,
  canDelete = false,
  onDelete,
  actions,
}: CalendarEventDetailProps) => {
  const { t } = useTranslation();
  const { event } = useCalendarEvent({ eventId });
  return (
    <>
      <DialogHeader
        onClose={onClose}
        actions={
          <>
            {canEdit && (
              <IconButton onClick={onEdit} aria-label={t('common.settings')}>
                <SettingsIcon />
              </IconButton>
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
      <Actions justifyContent="flex-end" padding={gutters()}>
        {canDelete && (
          <Button startIcon={<DeleteIcon />} onClick={onDelete} variant="outlined" color="error">
            {t('buttons.delete')}
          </Button>
        )}
        {actions}
      </Actions>
    </>
  );
};

export default CalendarEventDetail;
